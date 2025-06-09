<template>
  <div
    class="flex flex-col w-full border p-1 rounded-md mb-2"
    v-if="displayNodes.length > 0"
  >
    <button
      @click="isExpanded = !isExpanded"
      class="flex justify-between items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      <div class="flex items-center gap-1">
        <LucideGitBranch class="w-3.5 h-3.5" />
        <span>工作流</span>
        <div v-if="hasActiveNode" class="ml-1">
          <div class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
        </div>
      </div>
      <LucideChevronDown
        class="w-3.5 h-3.5 transition-transform"
        :class="{ 'rotate-180': !isExpanded }"
      />
    </button>

    <div v-if="isExpanded" class="flex flex-col pl-3 pr-2 mt-1">
      <div
        v-for="node in displayNodes"
        :key="getNodeKey(node)"
        class="flex flex-col border rounded-md p-0 mb-1 bg-white dark:bg-gray-800"
      >
        <div
          class="flex items-center gap-2 p-1 w-full transition-colors"
          :class="[
            node.data.status === 'succeeded'
              ? 'text-primary'
              : node.event === 'node_started'
              ? 'text-blue-500'
              : 'text-muted-foreground',
          ]"
        >
          <div
            class="flex items-center justify-center w-5 h-5 rounded"
            :class="[getNodeColor(node.data.node_type, node.data.status === 'succeeded', node.event === 'node_started')]"
          >
            <component
              :is="getNodeIcon(node.data.node_type)"
              class="w-3.5 h-3.5 text-white"
            />
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-xs text-left">
              {{ node.data.title }}
            </div>
          </div>
          <div class="flex items-center gap-1.5">
            <div v-if="node.data.elapsed_time" class="text-[10px]">
              {{ formatTime(node.data.elapsed_time) }}
            </div>
            <!-- 状态图标 -->
            <LucideCheck
              v-if="node.data.status === 'succeeded'"
              class="w-3 h-3 text-green-500"
            />
            <LucideX
              v-else-if="node.data.status === 'failed'"
              class="w-3 h-3 text-red-500"
            />
            <LucideSquare
              v-else-if="node.data.status === 'stopped'"
              class="w-3 h-3 text-yellow-500"
            />
            <LucideLoader2
              v-else
              class="w-3 h-3 animate-spin text-blue-500"
            />
          </div>
        </div>
        
        <!-- 显示该节点的流式内容 -->
        <div 
          v-if="streamingNodeIds.includes(getNodeId(node))" 
          class="px-2 py-1 text-xs border-t bg-muted/30"
        >
          <div class="font-mono overflow-hidden whitespace-nowrap overflow-ellipsis">
            {{ getStreamingContentForNode(getNodeId(node)) }}
            <span class="inline-block w-1 h-3 bg-primary animate-pulse"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type WorkflowNode } from "@/modules/ai/types/dify.type";
import { NODE_TYPES } from "@/modules/ai/tools/node-types";
import { LucideDot } from "lucide-vue-next";

const props = defineProps<{
  nodes: WorkflowNode[];
}>();

const isExpanded = ref(true);
const streamingContent = ref(new Map<string, string>());
const streamingNodeIds = ref<string[]>([]);

// 获取节点唯一ID的辅助函数
const getNodeId = (node: WorkflowNode) => {
  return node.data.node_id || node.data.id;
};

// 获取节点唯一Key的辅助函数
const getNodeKey = (node: WorkflowNode) => {
  return `${node.event}-${getNodeId(node)}`;
};

// 处理节点显示逻辑
const displayNodes = computed(() => {
  // 过滤掉 workflow_started 事件和没有title的节点
  const filteredNodes = props.nodes.filter(
    (node) => node.event !== "workflow_started" && !!node.data?.title
  );

  // 使用 Map 来存储节点状态
  const nodeMap = new Map<string, WorkflowNode>();
  // 存储迭代节点及其子节点的映射
  const iterationMap = new Map<string, string[]>();
  
  // 清空流式节点ID列表
  streamingNodeIds.value = [];

  // 第一遍扫描：收集所有节点和迭代信息
  filteredNodes.forEach((node) => {
    const nodeId = getNodeId(node);
    if (!nodeId) return;
    
    // 收集迭代ID和节点ID的映射
    if (node.data.iteration_id) {
      const iterationId = node.data.iteration_id;
      if (!iterationMap.has(iterationId)) {
        iterationMap.set(iterationId, []);
      }
      if (!iterationMap.get(iterationId)!.includes(nodeId)) {
        iterationMap.get(iterationId)!.push(nodeId);
      }
    }

    // 检查是否有text_chunk事件
    if (node.event === 'text_chunk' && node.data.from_variable_selector) {
      // 解析变量选择器，获取节点ID
      const [sourceNodeId] = node.data.from_variable_selector;
      if (sourceNodeId) {
        // 添加或更新节点的流内容
        const currentContent = streamingContent.value.get(sourceNodeId) || '';
        streamingContent.value.set(sourceNodeId, currentContent + (node.data.text || ''));
        
        // 标记为流式节点
        if (!streamingNodeIds.value.includes(sourceNodeId)) {
          streamingNodeIds.value.push(sourceNodeId);
        }
        
        // 确保节点存在于nodeMap中
        if (!nodeMap.has(sourceNodeId)) {
          // 查找该节点是否在其他地方有定义
          const sourceNode = filteredNodes.find(n => getNodeId(n) === sourceNodeId);
          if (sourceNode) {
            nodeMap.set(sourceNodeId, { ...sourceNode });
          }
        }
      }
      return;
    }

    // 如果这个节点ID还没有记录，就记录第一次出现的节点
    if (!nodeMap.has(nodeId)) {
      nodeMap.set(nodeId, { ...node });
    } else {
      // 如果已经有这个节点了，根据事件类型处理
      const existingNode = nodeMap.get(nodeId)!;
      
      // 迭代完成或节点完成事件
      if (node.event === 'node_finished' || node.event === 'iteration_completed') {
        // 更新原有节点的状态和时间
        existingNode.data.status = node.data.status;
        existingNode.data.elapsed_time = node.data.elapsed_time;
      }
      
      // 更新迭代进度
      if (node.event === 'iteration_next') {
        // 使用最新的迭代信息更新节点
        nodeMap.set(nodeId, { ...node });
      }
    }
  });

  // 第二遍处理：更新迭代节点的状态
  filteredNodes.forEach((node) => {
    if (node.event === 'iteration_completed' && node.data.iteration_id) {
      const iterationId = node.data.iteration_id;
      const nodeIds = iterationMap.get(iterationId) || [];
      
      // 更新所有属于该迭代的节点状态为完成
      nodeIds.forEach(id => {
        if (nodeMap.has(id)) {
          const nodeToUpdate = nodeMap.get(id)!;
          // 只更新尚未有明确状态的节点
          if (!nodeToUpdate.data.status) {
            nodeToUpdate.data.status = 'succeeded';
          }
        }
      });
    }
  });

  // 返回所有唯一的节点，按照它们在原数组中的顺序排序
  return Array.from(nodeMap.values());
});

// 检查是否有正在活动的节点（正在处理或流式输出）
const hasActiveNode = computed(() => {
  return displayNodes.value.some(node => 
    node.event === 'node_started' || 
    node.event === 'iteration_next' ||
    streamingNodeIds.value.includes(getNodeId(node)) || 
    (!node.data.status && node.event !== 'iteration_completed')
  );
});

// 获取节点图标组件名称
const getNodeIcon = (nodeType: string) => {
  const nodeConfig = Object.values(NODE_TYPES).find(
    (config) => config.type === nodeType
  );
  return nodeConfig?.icon || LucideDot;
};

// 获取节点颜色
const getNodeColor = (nodeType: string, isSucceeded: boolean, isStarted: boolean) => {
  const nodeConfig = Object.values(NODE_TYPES).find(
    (config) => config.type === nodeType
  );
  if (isStarted && !isSucceeded) {
    return 'bg-blue-500'; // 活动节点使用蓝色
  }
  const baseColor = nodeConfig?.color;
  return baseColor || "bg-gray-500";
};

// 获取节点的流式内容
const getStreamingContentForNode = (nodeId: string) => {
  return streamingContent.value.get(nodeId) || '';
};

const formatTime = (time: number) => {
  if (time >= 1) {
    return `${time.toFixed(3)} s`;
  }
  return `${(time * 1000).toFixed(3)} ms`;
};
</script>
