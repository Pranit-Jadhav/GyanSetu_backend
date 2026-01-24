import math
from typing import List, Dict, Tuple
from models import MasteryState, AssessmentAttempt, MasteryUpdate

# Standard BKT Parameters (Default)
P_TRANSIT = 0.1  # Probability of learning concept during a step
P_SLIP = 0.1     # Probability of slipping (knowing but answering wrong)
P_GUESS = 0.2    # Probability of guessing (not knowing but answering right)
MIN_MASTERY_INIT = 0.3

class MasteryEngine:
    def __init__(self):
        pass

    def _clamp(self, n, minn, maxn):
        return max(min(maxn, n), minn)

    def _get_status_label(self, probability: float) -> str:
        if probability < 0.4:
            return "Not Ready"
        elif probability < 0.6:
            return "Developing"
        elif probability < 0.8:
            return "Proficient"
        else:
            return "Mastered"

    def calculate_engagement_factor(self, engagement: float) -> float:
        # Engagement typically ranges 0.0 to 2.0+, normalize to roughly 0.5 to 1.5 multiplier
        # If engagement is 1.0 (standard), multiplier is 1.0
        return self._clamp(engagement, 0.5, 1.5)

    def update_concept(self, current_state: MasteryState, attempt: AssessmentAttempt) -> Tuple[float, float, str]:
        """
        Returns (new_probability, new_confidence, explanation)
        """
        p_known = current_state.probability
        engagement_factor = self.calculate_engagement_factor(attempt.engagement)
        
        # Adjust BKT parameters based on engagement
        # High engagement = less likely to be a lucky guess, more likely to be real learning
        # Low engagement = more likely to be a slip or shallow guess
        
        effective_p_learn = P_TRANSIT * engagement_factor
        
        if attempt.correct:
            # P(L|Correct) = (P(Correct|L) * P(L)) / P(Correct)
            # P(Correct|L) = 1 - P_SLIP
            # P(Correct|~L) = P_GUESS
            
            # If engagement is LOW, we suspect a guess more strongly
            effective_p_guess = P_GUESS
            if attempt.engagement < 0.8:
                effective_p_guess = min(0.5, P_GUESS * 1.5) # Increase guess probability if low engagement

            prob_correct = (p_known * (1 - P_SLIP)) + ((1 - p_known) * effective_p_guess)
            posterior = (p_known * (1 - P_SLIP)) / prob_correct
            
            explanation = f"Correct answer increased mastery. "
            if attempt.engagement > 1.2:
                explanation += "High engagement boosted learning confidence."
            elif attempt.engagement < 0.8:
                explanation += "Low engagement limited the increase (check for guessing)."
        else:
            # P(L|Incorrect) = (P(Incorrect|L) * P(L)) / P(Incorrect)
            # P(Incorrect|L) = P_SLIP
            # P(Incorrect|~L) = 1 - P_GUESS
            
            # If engagement is HIGH, we trust the failure more (it wasn't just a click-through)
            effective_p_slip = P_SLIP
            if attempt.engagement > 1.2:
                effective_p_slip = max(0.01, P_SLIP * 0.5) # Decrease slip probability if high engagement

            prob_incorrect = (p_known * effective_p_slip) + ((1 - p_known) * (1 - P_GUESS))
            posterior = (p_known * effective_p_slip) / prob_incorrect
            
            explanation = f"Incorrect answer decreased mastery. "
            if attempt.engagement > 1.2:
                explanation += "High engagement suggests a genuine knowledge gap."
        
        # Update step (learning transition)
        p_new = posterior + ((1 - posterior) * effective_p_learn)
        
        # Confidence Calculation
        # Simple heuristic: Confidence grows with attempts and consistency
        # Here we approximate: if update moves us away from 0.5, confidence increases
        # Also limit confidence growth based on engagement
        
        delta = abs(p_new - p_known)
        confidence_gain = delta * 0.5 * engagement_factor
        new_confidence = self._clamp(current_state.confidence + confidence_gain, 0.0, 0.95)
        
        return p_new, new_confidence, explanation

    def process_batch_updates(self, payload) -> List[MasteryUpdate]:
        updates = []
        
        # Group attempts by concept to handle multiple attempts for same concept in one batch
        attempts_by_concept = {}
        for attempt in payload.attempts:
            if attempt.concept_id not in attempts_by_concept:
                attempts_by_concept[attempt.concept_id] = []
            attempts_by_concept[attempt.concept_id].append(attempt)
            
        for concept_id, attempts in attempts_by_concept.items():
            # Get start state or default cold start
            state = payload.current_states.get(concept_id)
            if not state:
                state = MasteryState(concept_id=concept_id, probability=MIN_MASTERY_INIT, confidence=0.1)
                
            current_p = state.probability
            current_conf = state.confidence
            final_explanation = []
            
            for attempt in attempts:
                # Evolving state within the batch
                temp_state = MasteryState(concept_id=concept_id, probability=current_p, confidence=current_conf)
                p_next, conf_next, expl = self.update_concept(temp_state, attempt)
                current_p = p_next
                current_conf = conf_next
                final_explanation.append(expl)
            
            updates.append(MasteryUpdate(
                concept_id=concept_id,
                probability=round(current_p, 4),
                confidence=round(current_conf, 4),
                status=self._get_status_label(current_p),
                explanation=" | ".join(final_explanation)
            ))
            
        return updates
