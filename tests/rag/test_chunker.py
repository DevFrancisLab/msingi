from langchain_core.documents import Document

from app.rag.chunker import chunk_documents


def test_chunk_documents_splits_long_text():
    long_text = "Photosynthesis converts light energy into chemical energy. " * 100
    doc = Document(page_content=long_text, metadata={"source": "notes.txt"})

    chunks = chunk_documents([doc], chunk_size=200, chunk_overlap=20)

    assert len(chunks) > 1
    for chunk in chunks:
        assert len(chunk.page_content) <= 200 + 50  # splitter can slightly overshoot on separators
        assert chunk.metadata["source"] == "notes.txt"


def test_chunk_documents_preserves_metadata():
    doc = Document(page_content="Short text.", metadata={"subject": "Biology", "topic": "Photosynthesis"})

    chunks = chunk_documents([doc], chunk_size=200, chunk_overlap=20)

    assert len(chunks) == 1
    assert chunks[0].metadata["subject"] == "Biology"
    assert chunks[0].metadata["topic"] == "Photosynthesis"


def test_chunk_documents_empty_input_returns_empty_list():
    assert chunk_documents([]) == []
