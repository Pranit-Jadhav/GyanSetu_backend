def bkt_update(P_L, correct, engagement=1.0, P_T=0.15, P_G=0.2, P_S=0.1):
    """
    engagement range: 0.5 – 1.5
    """
    if correct:
        num = P_L * (1 - P_S)
        den = num + (1 - P_L) * P_G
    else:
        num = P_L * P_S
        den = num + (1 - P_L) * (1 - P_G)

    P_L_given = num / den
    P_T_adj = min(0.3, P_T * engagement)

    return round(P_L_given + (1 - P_L_given) * P_T_adj, 4)
