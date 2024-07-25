import React from 'react'
import uuid from '~/utils/uuid'

/**
 * 将数据转换成服务端需要的格式
 * @param {object} data 远程工单配置信息
 */
export function parseDataToServer(data) {
  const { modelMappingInfos } = data
  const {
    id,
    writeBack,
    currentNode,
    targetNode,
    currentModel,
    targetModel,
    targetModelConfirmTache
  } = modelMappingInfos
  const nextData = {
    id,
    writeBack,
    currentNodeId: currentNode.value,
    currentNodeName: currentNode.label,
    targetNodeId: targetNode.value,
    targetNodeName: targetNode.label,
    currentModelId: currentModel.key,
    currentModelName: currentModel.label,
    targetModelId: targetModel.key,
    targetModelName: targetModel.label,
    targetModelConfirmTacheId: targetModelConfirmTache && targetModelConfirmTache.key,
    targetModelConfirmTacheName: targetModelConfirmTache && targetModelConfirmTache.label
  }
  return nextData
}

export function newGroupData(group = {}) {
  const {
    id,
    writeBack,
    currentNodeId,
    currentNodeName,
    targetNodeId,
    targetNodeName,
    currentModelId,
    currentModelName,
    targetModelId,
    targetModelName,
    targetModelConfirmTacheId,
    targetModelConfirmTacheName
  } = group
  const newGroup = {
    id: id || uuid(),
    writeBack: !!writeBack
  }

  if (currentNodeId) {
    newGroup.currentNode = {
      label: currentNodeName,
      value: currentNodeId
    }
  }
  if (targetNodeId) {
    newGroup.targetNode = {
      label: targetNodeName,
      value: targetNodeId
    }
  }
  if (currentModelId) {
    newGroup.currentModel = {
      label: currentModelName,
      key: currentModelId
    }
  }
  if (targetModelId) {
    newGroup.targetModel = {
      label: targetModelName,
      key: targetModelId
    }
  }

  if (targetModelConfirmTacheId) {
    newGroup.targetModelConfirmTache = {
      label: targetModelConfirmTacheName,
      key: targetModelConfirmTacheId
    }
  }

  return newGroup
}
