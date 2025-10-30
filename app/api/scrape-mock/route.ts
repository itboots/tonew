import { NextResponse } from "next/server"
import { ValueItem } from "@/types"

// Mock data for demonstration
const mockData: ValueItem[] = [
  {
    id: "1",
    title: "赛博朋克2077：幻影自由DLC发布",
    link: "https://example.com/cyberpunk2077",
    description: "CD Projekt RED发布了备受期待的赛博朋克2077最新DLC，带来了全新的故事剧情和游戏体验。",
    category: "游戏",
    importance: 9.5,
    hotness: 150000,
    publishDate: "2024-10-30",
    scrapedAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "OpenAI发布GPT-5预览版",
    link: "https://example.com/openai-gpt5",
    description: "OpenAI今日发布了GPT-5的预览版本，在推理能力和多模态理解方面有了重大突破。",
    category: "AI技术",
    importance: 10,
    hotness: 500000,
    publishDate: "2024-10-29",
    scrapedAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "特斯拉发布全自动驾驶FSD v13",
    link: "https://example.com/tesla-fsd",
    description: "马斯克宣布特斯拉全自动驾驶系统进入v13版本，城市道路驾驶能力大幅提升。",
    category: "自动驾驶",
    importance: 8.8,
    hotness: 200000,
    publishDate: "2024-10-28",
    scrapedAt: new Date().toISOString(),
  },
  {
    id: "4",
    title: "苹果Vision Pro 2曝光，重量减轻40%",
    link: "https://example.com/apple-vision-pro-2",
    description: "据供应链消息，苹果第二代Vision Pro重量将显著减轻，续航时间提升至4小时。",
    category: "AR/VR",
    importance: 8.5,
    hotness: 120000,
    publishDate: "2024-10-27",
    scrapedAt: new Date().toISOString(),
  },
  {
    id: "5",
    title: "比特币突破90000美元历史新高",
    link: "https://example.com/bitcoin-price",
    description: "在全球经济不确定性增加的背景下，比特币价格首次突破90000美元大关。",
    category: "加密货币",
    importance: 9.2,
    hotness: 300000,
    publishDate: "2024-10-26",
    scrapedAt: new Date().toISOString(),
  },
  {
    id: "6",
    title: "Meta发布最强开源模型Llama 4",
    link: "https://example.com/meta-llama-4",
    description: "Meta发布了Llama 4系列开源模型，在多个基准测试中超越了闭源竞争对手。",
    category: "AI技术",
    importance: 9.7,
    hotness: 180000,
    publishDate: "2024-10-25",
    scrapedAt: new Date().toISOString(),
  },
  {
    id: "7",
    title: "中国天问二号火星探测器成功着陆",
    link: "https://example.com/mars-mission",
    description: "中国首个火星采样返回任务天问二号成功在火星预选区着陆，开始样本采集工作。",
    category: "航天科技",
    importance: 9.8,
    hotness: 250000,
    publishDate: "2024-10-24",
    scrapedAt: new Date().toISOString(),
  },
  {
    id: "8",
    title: "量子计算机实现1000量子比特突破",
    link: "https://example.com/quantum-computer",
    description: "IBM和谷歌同时宣布实现了1000量子比特的稳定运行，量子计算进入新纪元。",
    category: "量子计算",
    importance: 9.0,
    hotness: 160000,
    publishDate: "2024-10-23",
    scrapedAt: new Date().toISOString(),
  }
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedItems = mockData.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: paginatedItems,
      timestamp: new Date().toISOString(),
      metadata: {
        forceRefresh: false,
        itemCount: paginatedItems.length,
        total: mockData.length,
        page,
        pageSize,
        hasMore: endIndex < mockData.length,
        lastUpdate: new Date().toISOString(),
        shouldUpdate: false
      }
    })
  } catch (error) {
    console.error('Mock scrape error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch mock data' },
      { status: 500 }
    )
  }
}