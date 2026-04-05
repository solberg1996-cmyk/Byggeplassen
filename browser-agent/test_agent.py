import asyncio
from browser_use import Agent, Browser, ChatOpenAI

async def main():
    browser = Browser(headless=False)

    llm = ChatOpenAI(
        model="o3"
    )

    agent = Agent(
        task="Gå til example.com og beskriv siden",
        llm=llm,
        browser=browser,
        use_vision=True,
    )

    result = await agent.run()
    print(result)

asyncio.run(main())