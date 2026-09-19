import json
from typing import TypeVar

from pydantic import BaseModel, ValidationError


T = TypeVar("T", bound=BaseModel)


def parse_json_model(model: type[T], raw: str) -> T:
    try:
        return model.model_validate(json.loads(raw))
    except (json.JSONDecodeError, ValidationError) as exc:
        raise ValueError("AI response did not match the expected schema") from exc
