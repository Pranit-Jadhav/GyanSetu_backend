from engine import MasteryEngine
from models import MasteryState, AssessmentAttempt, BatchUpdatePayload

def test_engine():
    engine = MasteryEngine()
    
    print("--- Test 1: Cold Start Correct (Standard Engagement) ---")
    current_state = MasteryState(concept_id="C1", probability=0.3, confidence=0.0)
    attempt = AssessmentAttempt(concept_id="C1", correct=True, engagement=1.0)
    
    p, conf, expl = engine.update_concept(current_state, attempt)
    print(f"Old P: 0.3 -> New P: {p:.4f}, Conf: {conf:.4f}")
    print(f"Explanation: {expl}")
    
    print("\n--- Test 2: High Engagement Correct ---")
    # Should increase more than standard
    current_state = MasteryState(concept_id="C1", probability=0.3, confidence=0.0)
    attempt = AssessmentAttempt(concept_id="C1", correct=True, engagement=1.5)
    
    p_high, conf_high, expl = engine.update_concept(current_state, attempt)
    print(f"Old P: 0.3 -> New P: {p_high:.4f}, Conf: {conf_high:.4f}")
    assert p_high > p, "High engagement should increase mastery more"
    
    print("\n--- Test 3: Low Engagement Correct (Lucky Guess?) ---")
    # Should increase less than standard
    current_state = MasteryState(concept_id="C1", probability=0.3, confidence=0.0)
    attempt = AssessmentAttempt(concept_id="C1", correct=True, engagement=0.5)
    
    p_low, conf_low, expl = engine.update_concept(current_state, attempt)
    print(f"Old P: 0.3 -> New P: {p_low:.4f}, Conf: {conf_low:.4f}")
    assert p_low < p, "Low engagement should increase mastery less"

    print("\nAll manual tests passed!")

if __name__ == "__main__":
    test_engine()
