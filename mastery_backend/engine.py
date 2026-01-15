from bkt import bkt_update
from decay import apply_decay

class MasteryEngine:

    def update_concept(self, student, concept_id, correct, engagement):
        state = student.concepts.get(concept_id)

        if not state:
            from models import ConceptState
            state = ConceptState()

        state.P_L = apply_decay(state.P_L, state.last_seen)
        state.P_L = bkt_update(state.P_L, correct, engagement)
        state.last_seen = __import__("datetime").datetime.utcnow()

        student.concepts[concept_id] = state

    def mastery_score(self, P_L):
        return int(P_L * 100)

    def module_mastery(self, student, module):
        scores = [
            self.mastery_score(student.concepts[cid].P_L)
            for cid in module.concepts
            if cid in student.concepts
        ]
        return round(sum(scores) / len(scores), 2) if scores else 0

    def subject_mastery(self, student, subject, modules):
        module_scores = [
            self.module_mastery(student, modules[mid])
            for mid in subject.modules
        ]
        return round(sum(module_scores) / len(module_scores), 2) if module_scores else 0

    def overall_mastery(self, student):
        scores = [self.mastery_score(s.P_L) for s in student.concepts.values()]
        return round(sum(scores) / len(scores), 2) if scores else 0
