import random
import string
import uuid

def generate_invite_code(length=6):
    chars = string.ascii_uppercase + string.digits
    return "QF-" + "".join(random.choice(chars) for _ in range(length))

def generate_team_token():
    return str(uuid.uuid4())
