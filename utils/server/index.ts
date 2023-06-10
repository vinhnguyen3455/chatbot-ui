import { Message } from '@/types/chat';
import { OpenAIModel } from '@/types/openai';

import { AZURE_DEPLOYMENT_ID, OPENAI_API_HOST, OPENAI_API_TYPE, OPENAI_API_VERSION, OPENAI_ORGANIZATION } from '../app/const';

import {
  ParsedEvent,
  ReconnectInterval,
  createParser,
} from 'eventsource-parser';

export const OpenAIError = Error;


export const OpenAIStream = async (
  model: OpenAIModel,
  systemPrompt: string,
  temperature : number,
  key: string,
  messages: Message[],
) => {
  const url = 'http://backend:8001/questionnaires';

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
    },
  });

  if (!res.ok) {
    throw new OpenAIError(`HTTP error! Status: ${res.status}`);
  }

  const stream = new ReadableStream({
    async start(controller) {
      if (res.body === null) {
        // Handle the case when res.body is null
        controller.close();
        return;
      }

      const reader = res.body.getReader();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          controller.close();
          break;
        }

        controller.enqueue(value);
      }
    },
  });

  return stream;
};
