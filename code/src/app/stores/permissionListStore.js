import { action, runInAction, observable, toJS } from 'mobx'
import { store as runtimeStore } from '@uyun/runtime-react'
import uuid from '~/utils/uuid'
import {
  getCustomGroupData,
  validateName,
  validateCode,
  validateApp,
  validateUsersEmpty,
  validateGroupsEmpty,
  getUserAndRoleList
} from '../ticket/forms/permission/logic'
import * as R from 'ramda'

class PermissionListStore {
  // 存放工单下所有权限自服务字段数据
  @observable list = []

  // 服务范围内的所有用户组
  @observable allGroupsInServiceRange = []

  // 当前用户所在用户组
  @observable inGroups = []

  @observable getAllGroupsLoading = false

  @observable getInGroupsLoading = false

  push(data) {
    this.list.push(data)
  }

  removeStoreByFieldCode(fieldCode) {
    this.list = this.list.filter((item) => item.fieldCode !== fieldCode)
  }

  splitGeneralAndAdminGroups = (groups) => {
    return {
      selectionGroups: groups.filter((group) => group.type === 3 || group.type === 4),
      adminGroups: groups.filter(
        (group) => group.type === 0 || group.type === 1 || group.type === 2
      )
    }
  }

  // 根据用户id,获取服务范围内的所有用户组
  @action
  getGroupsByAppIdAndUserId = async (serviceRange, kw, serviceCode, selectedUsers) => {
    this.getAllGroupsLoading = true

    const body = {
      appIds: serviceRange.map((item) => item.appId),
      kw,
      userIds: selectedUsers.map((user) => user.userId),
      type: serviceCode
    }

    // 返回值格式: { appId1: [groups], appId2: [groups] }
    const res = (await axios.post(API.listDiffGroupsByAppIdMulti, body)) || {}

    runInAction(() => {
      let appGroups = []

      Object.keys(res).map((appId) => {
        const groups = res[appId]
          ? res[appId].map((item) => ({
              ...item,
              applicationId: item.groupId,
              status: 0
            }))
          : []
        appGroups = appGroups.concat(groups)
      })

      this.allGroupsInServiceRange = appGroups
      this.getAllGroupsLoading = false
    })
  }

  // 获取服务范围内的所有用户组
  @action
  getAllGroupsInServiceRange = async (serviceRange, kw) => {
    this.getAllGroupsLoading = true

    const promises = serviceRange.map((item) =>
      axios.get(API.listDiffAppGroupsByUserId, { params: { appId: item.appId, kw } })
    )

    const res = (await Promise.all(promises)) || []

    runInAction(() => {
      const groups = res.reduce((a, b) => {
        const app = b[0]
        if (!app || !app.groupVOS) {
          return a
        }
        const groupsInApp = app.groupVOS.map((item) => ({
          ...item,
          appId: app.appId,
          name: item.groupName,
          applicationId: item.groupId,
          code: item.groupCode,
          type: 3, // 预先设置一下type
          creator: runtimeStore.getState().user?.realname,
          status: 0
        }))
        return a.concat(groupsInApp)
      }, [])

      this.allGroupsInServiceRange = groups
      this.getAllGroupsLoading = false
    })
  }

  @action
  getInGroups = async () => {
    if (this.inGroups.length > 0) {
      return
    }

    this.getInGroupsLoading = true

    const res = (await axios.get(API.listDiffAppGroupsByUserId)) || []

    runInAction(() => {
      const groups = res.reduce((a, b) => {
        const groupsInApp = b.groupVOS
          ? b.groupVOS.map((item) => ({
              ...item,
              appId: b.appId,
              name: item.groupName,
              applicationId: item.groupId,
              code: item.groupCode,
              type: 4, // 因为这里的数据会用于申请退出，所以预先设置一下type
              creator: runtimeStore.getState().user?.realname,
              status: 0
            }))
          : []
        return a.concat(groupsInApp)
      }, [])

      this.inGroups = groups
      this.getInGroupsLoading = false
    })
  }

  // 获取工单中权限自服务字段关联的用户组
  @action
  getRelatedGroupsOfTicket = async (ticketId) => {
    const res = await axios.get(API.getGroupListOfTicket(ticketId))

    if (!res) {
      return
    }

    runInAction(() => {
      // 数据请求完成后，把数据分发至每个组件的store中

      this.list.forEach((item) => {
        const { fieldCode, store } = item
        const fieldData = res[fieldCode]

        if (fieldData) {
          const adminGroups = []

          fieldData.forEach((item) => {
            if (item.type === 0 || item.type === 1 || item.type === 2) {
              item = { ...item, ...getCustomGroupData() }
              adminGroups.push(item)
            }
            // 老数据处理
            if ((item.type === 3 || item.type === 4) && !item.rowId) {
              item.old = true
            } else if (!item.rowId) {
              item.rowId = uuid()
            }
          })

          store.setProps({ panels: fieldData })

          // 获取用户和角色后添加到panel数据中
          getUserAndRoleList(adminGroups).then((nextAdminGroups) => {
            fieldData.forEach((panel, index) => {
              const adminPanel = nextAdminGroups.find((item) => item.rowId === panel.rowId)

              if (adminPanel) {
                fieldData[index] = adminPanel
              }
            })
            store.setProps({ panels: fieldData })
          })
        } else {
          store.setProps({ panels: [] })
        }
      })
    })
  }

  @action postPermissionList = async (ticketId) => {
    // 如果当前list没有任何数据就不要提交了
    if (this.list.length === 0) return
    const data = {}
    for (const item of this.list) {
      const { fieldCode, store } = item
      const { panels } = store
      const panelsData = []
      panels.forEach((item) => {
        if (item.type === 3 || item.type === 4) {
          const result = R.pick(
            [
              'id',
              'name',
              'code',
              'description',
              'type',
              'status',
              'applicationId',
              'relatedUsers',
              'relatedGroups',
              'rowId'
            ],
            item
          )

          result.relatedGroups = R.project(
            ['id', 'appId', 'applicationId', 'code', 'name', 'status', 'type', 'descrition'],
            item.relatedGroups
          )

          panelsData.push(result)
        } else {
          const result = R.pick(
            [
              'id',
              'name',
              'code',
              'description',
              'type',
              'status',
              'relatedRoles',
              'relatedUsers',
              'appId',
              'rowId'
            ],
            item
          )
          // 如果有applicationId，说明这是个已经提交过的用户组，就把id和applicationId一起提交给后端
          if (item.applicationId) {
            result.applicationId = item.applicationId
          }

          panelsData.push(result)
        }
      })

      if (
        !_.find(panelsData, (item) => item.status === 2) ||
        !_.find(panelsData, (item) => item.status === 3)
      ) {
        data[fieldCode] = panelsData
      }
    }
    await axios.post(API.saveAssociateGroupList(ticketId), data)
  }

  @action.bound
  distory() {
    runInAction(() => {
      this.list = []
      this.permissionData = {}
    })
  }

  // codes: 需要校验的字段code，不传则校验所有权限自服务字段
  @action validate = (codes) => {
    const needValidateList =
      codes && codes.length > 0
        ? this.list.filter((item) => codes.includes(item.fieldCode))
        : this.list

    let passed = true
    let isEmpty = true
    for (const item of needValidateList) {
      const { store, isRequired } = item
      const { selectionGroups, adminGroups } = this.splitGeneralAndAdminGroups(store.panels)

      if (adminGroups.length > 0) {
        isEmpty = false
        for (const group of adminGroups) {
          const { name, code, appId } = group
          const nameInfo = validateName(name)
          const codeInfo = validateCode(code)
          const appInfo = validateApp(appId)
          group.nameInfo = nameInfo
          group.codeInfo = codeInfo
          group.appInfo = appInfo
          if (
            nameInfo.validateStatus === 'error' ||
            codeInfo.validateStatus === 'error' ||
            appInfo.validateStatus === 'error'
          ) {
            passed = false
          }
        }
      }
      if (selectionGroups.length > 0) {
        isEmpty = false
        for (const group of selectionGroups) {
          const { relatedUsers, relatedGroups } = group
          group.usersInfo = validateUsersEmpty(relatedUsers)
          group.groupsInfo = validateGroupsEmpty(relatedGroups)
          if (
            group.usersInfo.validateStatus === 'error' ||
            group.groupsInfo.validateStatus === 'error'
          ) {
            passed = false
          }
        }
      }
      if (isRequired === 1 && isEmpty) {
        passed = false
        store.setProps({
          fieldValidateInfo: {
            validateStatus: 'error',
            help: i18n('field-cannot-empty', '该字段不能为空')
          }
        })
      } else {
        store.setProps({
          fieldValidateInfo: {
            validateStatus: 'success',
            help: ''
          }
        })
      }
    }
    return passed
  }
}

export default new PermissionListStore()
