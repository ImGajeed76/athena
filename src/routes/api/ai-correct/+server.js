import {OPENAI_API_KEY, OPENAI_MODEL} from "$env/static/private";
import {Configuration, OpenAIApi} from "openai";

const validDomains = [
    'https://athena-imgajeed76.vercel.app',
    'https://athena-one-iota.vercel.app',
    'https://athena-git-master-imgajeed76.vercel.app',
    'http://localhost:5173'
];

const validKey = "pwlnN0m6jwIU1JQvTfVLTcRkLvYFC2yZCTanSi1ZWq1bgounuTtdFGYLMs4xiGFvpuObPTcpKYSOdP1oKSnb5ZQHy0u1NyfadrKdT5OOVnlC7daxcDiTh2uuSRklxM2V"

const openai = new OpenAIApi(
    new Configuration({apiKey: OPENAI_API_KEY})
)

export const POST = async ({ request }) => {
    const origin = request.headers.get('origin');
    if (!validDomains.includes(origin)) {
        return new Response('Unauthorized: Invalid URL', { status: 401 });
    }

    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== validKey) {
        return new Response('Unauthorized: Invalid Key', { status: 401 });
    }

    const secFetchSite = request.headers.get('sec-fetch-site');
    if (secFetchSite !== 'same-origin') {
        return new Response('Unauthorized: Invalid Origin', { status: 401 });
    }

    const body = await request.json();
    console.log(body);

    const messages = [
        {role: "system", content: "Is the users answer correct? As long as the meaning of the users answer and the correct answer match its good. Other languages are also allowed. Respond with a code-block including true or false.\n" +
                "Correct Answer:```" + body.correct_text + "```" +
                "Users Answer:```" + body.text + "```"}
    ]

    const completion = await openai.createChatCompletion({
        model: OPENAI_MODEL,
        messages
    })

    if (!completion || !completion.data || !completion.data.choices || completion.data.choices.length === 0 || !completion.data.choices[0].message) {
        return new Response("Open AI Error", {status: 500})
    }

    const response = completion.data.choices[0].message.content

    console.log(response)

    if (!response) {
        return new Response("Empty Response", {status: 500})
    }

    return new Response(JSON.stringify({
        "model": OPENAI_MODEL,
        "correct": response.toLowerCase().includes("true")
    }), {status: 200, headers: {'content-type': 'application/json'}});
}