import shutil
import tempfile
from pathlib import Path

import pytest

from app.ai.ollama import check_ollama_available
from app.core.config import Settings


@pytest.fixture
def tmp_settings(tmp_path):
    """Isolated Settings pointing at a scratch curriculum/vectorstore dir."""
    raw_dir = tmp_path / "raw"
    vs_dir = tmp_path / "vectorstore"
    raw_dir.mkdir()
    return Settings(
        curriculum_raw_dir=str(raw_dir),
        curriculum_vectorstore_dir=str(vs_dir),
        chroma_collection_name="test_collection",
        database_url="sqlite:///:memory:",
    )


@pytest.fixture(scope="session")
def ollama_available():
    settings = Settings()
    ok, _ = check_ollama_available(settings)
    return ok


def pytest_collection_modifyitems(config, items):
    settings = Settings()
    ok, _ = check_ollama_available(settings)
    if ok:
        return
    skip_marker = pytest.mark.skip(reason="Ollama is not available/model not pulled")
    for item in items:
        if "requires_ollama" in item.keywords:
            item.add_marker(skip_marker)
