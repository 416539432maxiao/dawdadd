import { defineEventHandler, getQuery, getHeader } from 'h3'
import { difyRequest } from '@/server/utils/dify-tools'
import { AppKey } from '@/config/ai/index'

interface ConversationsQuery {
  user: string
  last_id?: string
  limit?: string
  sort_by?: 'created_at' | '-created_at' | 'updated_at' | '-updated_at'
}

export default defineEventHandler(async (event) => {
  const appid = getHeader(event, "x-app-id") as AppKey;
  // 获取查询参数
  const query = getQuery(event) as ConversationsQuery;

  // 验证必需的参数
  if (!query.user) {
    throw createError({
      statusCode: 400,
      message: 'Missing required parameter: user',
    })
  }

  try {
    // 构建请求参数
    const params = new URLSearchParams()
    params.append('user', query.user)
    
    // 添加可选参数
    if (query.last_id) {
      params.append('last_id', query.last_id)
    }
    if (query.limit) {
      params.append('limit', query.limit)
    }
    if (query.sort_by) {
      params.append('sort_by', query.sort_by)
    }

    // 发送请求到 Dify API
    const response = await difyRequest(appid, `/conversations?${params.toString()}`, {
      method: 'GET',
    })

    return response
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch conversations',
    })
  }
}) 