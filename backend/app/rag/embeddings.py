from functools import lru_cache
import hashlib
import math
import re
from collections import Counter


TOKEN_RE = re.compile(r"[a-zA-Z][a-zA-Z0-9_-]{1,}")


def tokenize(text: str) -> list[str]:
    return [token.lower() for token in TOKEN_RE.findall(text)]


@lru_cache(maxsize=8192)
def _token_index_and_sign(token: str, dimensions: int = 256) -> tuple[int, float]:
    digest = hashlib.sha256(token.encode("utf-8")).digest()
    index = int.from_bytes(digest[:4], "big") % dimensions
    sign = 1.0 if digest[4] % 2 == 0 else -1.0
    return index, sign


@lru_cache(maxsize=4096)
def _compute_embedding(text: str, dimensions: int = 256) -> tuple[float, ...]:
    counts = Counter(tokenize(text))
    vector = [0.0] * dimensions
    for token, count in counts.items():
        index, sign = _token_index_and_sign(token, dimensions)
        vector[index] += sign * (1.0 + math.log(count))
    norm = math.sqrt(sum(v * v for v in vector))
    return tuple(v / norm for v in vector) if norm else tuple(vector)


class HashingEmbeddingProvider:
    def __init__(self, dimensions: int = 256) -> None:
        self.dimensions = dimensions

    def embed(self, text: str) -> list[float]:
        return list(_compute_embedding(text, self.dimensions))

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        return [list(_compute_embedding(text, self.dimensions)) for text in texts]

    @staticmethod
    def cache_stats() -> dict[str, int]:
        info = _compute_embedding.cache_info()
        return {"hits": info.hits, "misses": info.misses, "size": info.currsize}

    @staticmethod
    def token_cache_stats() -> dict[str, int]:
        info = _token_index_and_sign.cache_info()
        return {"hits": info.hits, "misses": info.misses, "size": info.currsize}


def cosine_similarity(a: list[float], b: list[float]) -> float:
    return sum(x * y for x, y in zip(a, b))

