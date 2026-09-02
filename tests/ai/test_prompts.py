from app.ai.prompts import build_prompt


def test_build_prompt_includes_teacher_context():
    messages = build_prompt(
        question="Explain this topic to me.",
        context="Photosynthesis converts light energy into chemical energy.",
        grade="Grade 10",
        subject="Biology",
        topic="Photosynthesis",
    )
    rendered = "\n".join(m.content for m in messages)

    assert "Grade 10" in rendered
    assert "Biology" in rendered
    assert "Photosynthesis" in rendered
    assert "Explain this topic to me." in rendered


def test_build_prompt_handles_missing_context():
    messages = build_prompt(
        question="What should I teach?",
        context="",
        grade="Grade 10",
        subject="Biology",
        topic="Photosynthesis",
    )
    rendered = "\n".join(m.content for m in messages)

    assert "No relevant curriculum material was found" in rendered


def test_build_prompt_handles_missing_teacher_context():
    messages = build_prompt(question="Explain this.", context="Some context.", grade=None, subject=None, topic=None)
    rendered = "\n".join(m.content for m in messages)

    assert "Not specified" in rendered


def test_build_prompt_system_message_instructs_teacher_focus():
    messages = build_prompt(question="q", context="c", grade="Grade 10", subject="Biology", topic="Topic")
    system_message = messages[0]

    assert system_message.type == "system"
    assert "teacher" in system_message.content.lower()
