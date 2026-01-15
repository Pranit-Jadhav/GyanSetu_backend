from datetime import datetime

def apply_decay(P_L, last_seen, decay_rate=0.01):
    days = (datetime.utcnow() - last_seen).days
    decayed = P_L * ((1 - decay_rate) ** days)
    return round(max(decayed, 0.1), 4)
