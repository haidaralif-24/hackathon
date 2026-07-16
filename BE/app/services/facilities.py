from __future__ import annotations

from app.config import settings

FACILITY_MAP = {
    "emergency": "hospital",
    "24h": "urgent_care",
    "monitor": "doctor",
}

SPECIALIST_MAP = {
    "cardiologist": "hospital",
    "dermatologist": "clinic",
    "emergency_room": "hospital",
    "orthopedic": "hospital",
    "pediatrician": "clinic",
    "ophthalmologist": "clinic",
    "dentist": "clinic",
    "psychiatrist": "clinic",
    "general_practitioner": "doctor",
}

HARDCODED_FACILITIES = [
    {"name": "RS Siloam Kebon Jeruk", "type": "hospital", "address": "Jl. Raya Perjuangan No.8, Jakarta Barat", "lat": -6.1488, "lng": 106.7633, "phone": "(021) 5369900"},
    {"name": "RS Medistra", "type": "hospital", "address": "Jl. Gatot Subroto Kav. 59, Jakarta Selatan", "lat": -6.2303, "lng": 106.8242, "phone": "(021) 5210200"},
    {"name": "RS Cipto Mangunkusumo", "type": "hospital", "address": "Jl. Pangeran Diponegoro No.71, Jakarta Pusat", "lat": -6.1996, "lng": 106.8465, "phone": "(021) 1500888"},
    {"name": "Klinik Kimia Farma", "type": "clinic", "address": "Jl. KH Wahid Hasyim No.88, Jakarta Pusat", "lat": -6.1879, "lng": 106.8247, "phone": "(021) 3912525"},
    {"name": "Puskesmas Kecamatan Tanah Abang", "type": "doctor", "address": "Jl. KH Mas Mansyur No.62, Jakarta Pusat", "lat": -6.1922, "lng": 106.8103, "phone": "(021) 31904567"},
    {"name": "UGD RS Pelni", "type": "hospital", "address": "Jl. K.S. Tubun No.92, Jakarta Barat", "lat": -6.1568, "lng": 106.7983, "phone": "(021) 5482525"},
    {"name": "RS Royal Taruma", "type": "hospital", "address": "Jl. Daan Mogot No.34, Jakarta Barat", "lat": -6.1531, "lng": 106.7858, "phone": "(021) 56985888"},
    {"name": "Klinik Sehat", "type": "doctor", "address": "Jl. Kemanggisan Raya No.15, Jakarta Barat", "lat": -6.1617, "lng": 106.7944, "phone": "(021) 5326688"},
]


def _resolve_type(urgency: str, specialist: str | None) -> str:
    if specialist and specialist in SPECIALIST_MAP:
        return SPECIALIST_MAP[specialist]
    return FACILITY_MAP.get(urgency, "doctor")


def get_facilities(urgency: str, specialist: str | None = None) -> list[dict]:
    target = _resolve_type(urgency, specialist)
    results = [f for f in HARDCODED_FACILITIES if f["type"] == target]
    if not results:
        results = HARDCODED_FACILITIES
    return results[:5]


def search_places(urgency: str, specialist: str | None = None, lat: float | None = None, lng: float | None = None) -> list[dict]:
    if not settings.maps_api_key or not lat or not lng:
        return get_facilities(urgency, specialist)
    target = _resolve_type(urgency, specialist)
    return get_facilities(urgency, specialist)
