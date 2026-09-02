from pathlib import Path

from app.rag.loader import load_curriculum_documents


def _write_sample(raw_dir: Path) -> Path:
    doc_dir = raw_dir / "Biology" / "Grade 10" / "Photosynthesis"
    doc_dir.mkdir(parents=True)
    path = doc_dir / "notes.txt"
    path.write_text(
        "Photosynthesis is the process by which green plants convert light energy "
        "into chemical energy stored in glucose. It occurs in the chloroplasts and "
        "requires carbon dioxide, water, and sunlight, producing oxygen as a byproduct."
    )
    return path


def test_load_curriculum_documents_reads_text_files(tmp_settings):
    raw_dir = Path(tmp_settings.curriculum_raw_dir)
    _write_sample(raw_dir)

    docs = load_curriculum_documents(raw_dir)

    assert len(docs) == 1
    assert "Photosynthesis" in docs[0].page_content


def test_load_curriculum_documents_derives_metadata_from_directory_structure(tmp_settings):
    raw_dir = Path(tmp_settings.curriculum_raw_dir)
    _write_sample(raw_dir)

    docs = load_curriculum_documents(raw_dir)

    meta = docs[0].metadata
    assert meta["subject"] == "Biology"
    assert meta["grade"] == "Grade 10"
    assert meta["topic"] == "Photosynthesis"
    assert meta["source"] == "notes.txt"


def test_load_curriculum_documents_empty_dir_returns_empty_list(tmp_settings):
    docs = load_curriculum_documents(tmp_settings.curriculum_raw_dir)
    assert docs == []


def test_load_curriculum_documents_missing_dir_returns_empty_list(tmp_path):
    docs = load_curriculum_documents(tmp_path / "does_not_exist")
    assert docs == []
