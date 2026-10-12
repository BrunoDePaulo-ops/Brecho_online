import uuid
from datetime import timezone

import boto3
from boto3.dynamodb.types import TypeSerializer
from django.conf import settings
from django.utils import timezone
from functools import lru_cache

_serializer = TypeSerializer()


@lru_cache(maxsize=1)
def _client():
    return boto3.client("dynamodb", region_name=settings.AWS_REGION)
    
def registrar_evento(action, entity, entity_id, actor_id=None, data=None):
    evento = {
        "id": str(uuid.uuid4()),
        "action": action,
        "entity": entity,
        "entity_id": str(entity_id),
        "actor_id": str(actor_id) if actor_id is not None else "system",
        "timestamp": timezone.now().isoformat(),
        "data": data if data is not None else {},
    }
    
    _client().put_item(
        TableName=settings.DYNAMODB_TABLE,
        Item={k: _serializer.serialize(v) for k, v in evento.items()},
        ConditionExpression="attribute_not_exists(id)",
    )

    return evento