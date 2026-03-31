import json
from channels.generic.websocket import AsyncWebsocketConsumer

class SimulationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.session_id = self.scope['url_route']['kwargs']['session_id']
        self.room_group_name = f'sim_{self.session_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        data = json.loads(text_data)
        
        # Broadcast position/state to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'sim_update',
                'data': data
            }
        )

    # Receive message from room group
    async def sim_update(self, event):
        data = event['data']

        # Send message to WebSocket
        await self.send(text_data=json.dumps(data))
