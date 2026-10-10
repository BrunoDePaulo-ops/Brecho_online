import uuid
from datetime import datetime, timezone

import boto3
from django.conf import settings
from django.utils import timezone

def registrar_evento(action, entity, entity_id, actor_id=None, data=None):

    dynamodb = boto3.resource(
        "dynamodb",
        region_name=settings.AWS_REGION,
    )

    table = dynamodb.Table(settings.DYNAMODB_TABLE)

    evento = {
        "id": str(uuid.uuid4()),
        "action": action,
        "entity": entity,
        "entity_id": str(entity_id),
        "actor_id": str(actor_id) if actor_id is not None else "system",
        "timestamp": timezone.now().isoformat(),
        "data": data if data is not None else {},
    }

    table.put_item(
        Item=evento,
        ConditionExpression="attribute_not_exists(id)",
    )

    return evento