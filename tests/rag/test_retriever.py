from pathlib import Path

from app.rag.ingest import run_ingestion
from app.rag.retriever import CurriculumRetriever


def _seed_curriculum(raw_dir: Path):
    bio_dir = raw_dir / "Biology" / "Grade 10" / "Photosynthesis"
    bio_dir.mkdir(parents=True)
    (bio_dir / "notes.txt").write_text(
        "Photosynthesis is the process by which plants use sunlight, water, and "
        "carbon dioxide to produce glucose and oxygen. It takes place in the "
        "chloroplasts, mainly in the leaves. The chlorophyll pigment absorbs light "
        "energy which drives the light-dependent reactions."
    )

    resp_dir = raw_dir / "Biology" / "Grade 10" / "Respiration"
    resp_dir.mkdir(parents=True)
    (resp_dir / "notes.txt").write_text(
        "Respiration is the process by which cells break down glucose to release "
        "energy in the form of ATP. Aerobic respiration requires oxygen and takes "
        "place in the mitochondria."
    )


def test_ingestion_and_retrieval_end_to_end(tmp_settings):
    _seed_curriculum(Path(tmp_settings.curriculum_raw_dir))

    result = run_ingestion(tmp_settings)
    assert result["documents_loaded"] == 2
    assert result["chunks_created"] >= 2

    retriever = CurriculumRetriever(tmp_settings)
    results = retriever.retrieve("What are the key ideas I need to teach about photosynthesis?")

    assert len(results) > 0
    assert any("photosynthesis" in r.content.lower() or "chlorophyll" in r.content.lower() for r in results)


def test_retrieval_preserves_metadata(tmp_settings):
    _seed_curriculum(Path(tmp_settings.curriculum_raw_dir))
    run_ingestion(tmp_settings)

    retriever = CurriculumRetriever(tmp_settings)
    results = retriever.retrieve("How do plants make glucose?")

    assert results[0].metadata.get("subject") == "Biology"
    assert results[0].metadata.get("topic") in {"Photosynthesis", "Respiration"}


def test_retrieval_distinguishes_topics(tmp_settings):
    _seed_curriculum(Path(tmp_settings.curriculum_raw_dir))
    run_ingestion(tmp_settings)

    retriever = CurriculumRetriever(tmp_settings)
    results = retriever.retrieve("What should learners understand about respiration and ATP?")

    top_topics = {r.metadata.get("topic") for r in results[:2]}
    assert "Respiration" in top_topics


def test_retrieve_empty_query_returns_empty_list(tmp_settings):
    _seed_curriculum(Path(tmp_settings.curriculum_raw_dir))
    run_ingestion(tmp_settings)

    retriever = CurriculumRetriever(tmp_settings)
    assert retriever.retrieve("") == []
    assert retriever.retrieve("   ") == []


def test_retrieve_against_empty_vectorstore_returns_empty_list(tmp_settings):
    retriever = CurriculumRetriever(tmp_settings)
    assert retriever.is_empty()
    assert retriever.retrieve("Explain photosynthesis") == []
