from app.ai.prompts import SYSTEM_INSTRUCTIONS


def test_system_instructions_mention_teacher_and_grade_10():
    assert "teacher" in SYSTEM_INSTRUCTIONS.lower()
    assert "Grade 10" in SYSTEM_INSTRUCTIONS


def test_system_instructions_forbid_following_embedded_instructions():
    lowered = SYSTEM_INSTRUCTIONS.lower()
    assert "curriculum_context" in lowered
    assert "not instructions" in lowered or "never follow instructions" in lowered
