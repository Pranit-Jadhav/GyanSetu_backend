def practice_by_module(student, modules):
    plan = {}

    for mid, module in modules.items():
        plan[mid] = {"remedial": [], "core": [], "stretch": []}

        for cid in module.concepts:
            if cid not in student.concepts:
                continue

            P_L = student.concepts[cid].P_L

            if P_L < 0.4:
                plan[mid]["remedial"].append(cid)
            elif P_L < 0.75:
                plan[mid]["core"].append(cid)
            elif P_L < 0.85:
                plan[mid]["stretch"].append(cid)

    return plan


def weak_concepts(student, threshold=0.6):
    return [
        cid for cid, s in student.concepts.items()
        if s.P_L < threshold
    ]
