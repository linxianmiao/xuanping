import React, { Component } from 'react'
import { store as runtimeStore } from '@uyun/runtime-react'
import Organization from './tabs/organization'
import UserGroup from './tabs/userGroup'
import User from './tabs/user'
import { Trim, Browser, delayQuery } from '../utils/index'
import './style/style.less'
import { Button, Tabs } from '@uyun/components'
const TabPane = Tabs.TabPane
export default class UserSystem extends Component {
    state = {
    // this.pageNum = 2;

      // 指定的人员范围
      filterUser: [],
      // 已选择的数据
      selectedData: this.props.selectedData || [],
      // 组织机构数据
      orgData: [],
      // 用户组数据
      ugData: [],
      // 组织机构 初始化 面包屑
      crumbOrg: [{
        name: i18n('organization', '组织机构'),
        id: 0
      }],
      // 用户组 初始化 面包屑
      crumbUG: [{
        name: i18n('user_group', '用户组'),
        id: 0
      }],
      // 搜索中  清除按钮显示(组织机构)
      clearOrgX: false,
      // 搜索内容 初始化(组织机构)
      searchOrg: '',
      // 搜索中  清除按钮显示(用户组)
      clearUgX: false,
      // 搜索内容 初始化(用户组)
      searchUg: '',
      // 搜索中  清除按钮显示(人员)
      clearUserX: false,
      // 搜索内容 初始化(人员)
      searchUser: '',
      // status: {
      //   部门是否禁用 1（是）0（否）
      //   status1: 1,
      //   组是否禁用 1（是）0（否）
      //   status2: 0,
      //   人员是否禁用 1（是）0（否）
      //   status3: 1
      // },
      status: this.props.status,
      // 选择状态
      // 是否是单选 1（是）0（否）
      // opt: 0,
      opt: this.props.opt,
      // 是否要指定人员1（是）0（否）
      assign: this.props.assign,
      isProductManage:
        !_.isUndefined(_.find(runtimeStore.getState().authorizedApps, { productNum: '1008' }))
          ? _.find(runtimeStore.getState().authorizedApps, { productNum: '1008' }).role
          : false,
      bro: Browser.browser(),
      pageSize: 15,
      queryCount: 0,
      orderType: null, // 待办工单 排序 null
      pageNum: 2
    }

    // 初始化数据（是否需要过滤掉用户id）
    // 第五个参数为判断选择组织机构时，没有组织不许下钻
    filiterUserId = (id, org, ug, user, itemData) => {
      const { selectedData, assign } = this.state
      const filterUserId = []
      // this.props.filterUser 过滤筛选的用户（指定的 人员）
      !_.isEmpty(this.props.filterUser) && this.props.filterUser.forEach(item => {
        filterUserId.push(item.userId)
      })
      // 组织机构数据
      let OData = null
      // 用户组数据
      let UData = null
      // 人员 数据
      let UserData = null
      // 如果有指定的 人 把 指定人员 给后台
      if (!_.isEmpty(filterUserId)) {
        OData = {
          id: id || 0,
          assignUser: filterUserId, // 指定的人员
          orgId: this.props.orgId, // 组织机构的所属部门
          filterRule: this.props.filterRule, // 组织机构的过滤规则，
          /// 普通改派（管理员可以选全部人） 参数为 1 如果是会签改派时 传 0（和正常处理人一样，不能全部选人）
          /// ressignAndCountersign 1会签 0不是会签
          reassign: this.props.reassign ? this.props.ressignAndCountersign ? 0 : 1 : 0
        }
        UData = {
          assignUser: filterUserId,
          orgId: this.props.orgId,
          filterRule: this.props.filterRule,
          /// 普通改派（管理员可以选全部人） 参数为 1 如果是会签改派时 传 0（和正常处理人一样，不能全部选人）
          reassign: this.props.reassign ? this.props.ressignAndCountersign ? 0 : 1 : 0
        }
        UserData = {
          assignUser: filterUserId,
          pageNum: 1,
          pageSize: 15,
          orderType: this.state.orderType, // 人员排序
          orgId: this.props.orgId,
          filterRule: this.props.filterRule,
          /// 普通改派（管理员可以选全部人） 参数为 1 如果是会签改派时 传 0（和正常处理人一样，不能全部选人）
          reassign: this.props.reassign ? this.props.ressignAndCountersign ? 0 : 1 : 0
        }
      } else {
        OData = {
          id: id || 0,
          orgId: this.props.orgId,
          filterRule: this.props.filterRule,
          /// 普通改派（管理员可以选全部人） 参数为 1 如果是会签改派时 传 0（和正常处理人一样，不能全部选人）
          reassign: this.props.reassign ? this.props.ressignAndCountersign ? 0 : 1 : 0
        }
        UData = {
          orgId: this.props.orgId,
          filterRule: this.props.filterRule,
          /// 普通改派（管理员可以选全部人） 参数为 1 如果是会签改派时 传 0（和正常处理人一样，不能全部选人）
          reassign: this.props.reassign ? this.props.ressignAndCountersign ? 0 : 1 : 0
        }
        UserData = {
          pageNum: 1,
          pageSize: 15,
          orderType: this.state.orderType,
          orgId: this.props.orgId,
          filterRule: this.props.filterRule,
          /// 普通改派（管理员可以选全部人） 参数为 1 如果是会签改派时 传 0（和正常处理人一样，不能全部选人）
          reassign: this.props.reassign ? this.props.ressignAndCountersign ? 0 : 1 : 0
        }
      }
      if (org) {
      // 请求组织机构
        axios.post(API.get_depart_user_list, OData).then(data => {
          const departs = data.departs
          const users = data.users
          const concatData = [].concat([], departs || [], users || [])
          const orgData = this.setSelectedData(selectedData, concatData)
          if (itemData) {
          // 没有部门不许下钻
            if (!_.isEmpty(departs)) {
              const { crumbOrg } = this.state
              crumbOrg.push({ id: itemData.id, name: itemData.name })
              this.setState({ orgData })
            }
          } else {
            this.setState({ orgData })
          }
        })
      }
      if (ug) {
      // 请求用户组
        if (this.props.isassignGroup) {
          const ugData = this.setSelectedData(selectedData, this.props.filterUser)
          this.setState({ ugData })
        } else {
          axios.post(API.query_group_list, UData).then(data => {
            const ugData = this.setSelectedData(selectedData, data)
            this.setState({ ugData })
          })
        }
      }
      // assign 是否 有 指定的 人
      if (user && assign) {
      // 请求人员
        axios.post(API.query_user_with_ticket_num, UserData).then(data => {
          const filterUser = this.setSelectedData(selectedData, data.list)
          this.setState({ filterUser, queryCount: data.count })
        })
      }
    }

    /**
  * [setSelectedData 初始化 选择列表数据（组织机构和用户组）]
  * @param  {[array]} type [arry已选择]
  * @param  {[array]} type [other需选择]
  * @return {[type]}      [返回一个处理后的组织机构数据或用户组数据]
  */
    setSelectedData = (arry, other) => {
      arry.forEach(item => {
        other.forEach((item1, index) => {
        // 判断是否选中
          if (this.conditionSelected(item, item1)) {
          // 已选中
            other[index].selected = true
            // 单选状态下
            if (this.state.opt === 1) {
              other[index].opt = 0
            }
          } else {
          // 单选状态下
            if (this.state.opt === 1) {
              other[index].opt = 1
            }
          }
        })
      })
      return other
    }

    componentDidMount () {
      this.filiterUserId(false, true, true, true)
      const { assign, status } = this.state
      // 监听列表滚动条
      if (assign && status.status3 !== 1) {
        this.refuser.transferList.addEventListener('scroll', this.handleScroll)
      }
    }

    componentWillUnmount () {
      const { assign, status } = this.state
      // 移除的时候取消监听
      if (assign && status.status3 !== 1) {
        this.refuser.transferList.removeEventListener('scroll', this.handleScroll)
      }
    }

    componentDidUpdate (prevProps, prevState) {
    // 判断两种状态下 搜索的变化
    // 搜索请求参数 type 0:所有 1: 仅部门或组 2: 仅用户
      const { status, selectedData } = this.state
      if (this.state.searchOrg !== prevState.searchOrg) {
      // 组织机构
        if (Trim.trim(this.state.searchOrg)) {
          const filterUserId = []
          // this.props.filterUser 过滤筛选的用户
          !_.isEmpty(this.props.filterUser) && this.props.filterUser.forEach(item => {
            filterUserId.push(item.userId)
          })
          // 组织机构数据
          let OData = null
          if (!_.isEmpty(filterUserId)) {
            OData = {
              wd: Trim.trim(this.state.searchOrg),
              assignUser: filterUserId,
              type: status.status1 === 0 && status.status3 === 1 ? 1 : 0,
              orgId: this.props.orgId,
              filterRule: this.props.filterRule,
              /// 普通改派（管理员可以选全部人） 参数为 1 如果是会签改派时 传 0（和正常处理人一样，不能全部选人）
              reassign: this.props.reassign ? this.props.ressignAndCountersign ? 0 : 1 : 0
            }
          } else {
            OData = {
              wd: Trim.trim(this.state.searchOrg),
              type: status.status1 === 0 && status.status3 === 1 ? 1 : 0,
              orgId: this.props.orgId,
              filterRule: this.props.filterRule,
              reassign: this.props.reassign ? this.props.ressignAndCountersign ? 0 : 1 : 0
            }
          }
          delayQuery(() => {
            axios.post(API.query_depart_and_users, OData).then(data => {
              const concatData = [].concat([], data || [])
              const orgData = this.setSelectedData(selectedData, concatData)
              this.setState({ orgData })
            })
          })
        } else {
          delayQuery(() => {
            this.filiterUserId(false, true, false, false)
          })
        }
      }
      if (this.state.searchUg !== prevState.searchUg) {
      // 用户组
        if (Trim.trim(this.state.searchUg)) {
          const filterUserId = []
          // this.props.filterUser 过滤筛选的用户
          !_.isEmpty(this.props.filterUser) && this.props.filterUser.forEach(item => {
            filterUserId.push(item.userId)
          })
          // 用户组数据
          let UData = null
          if (!_.isEmpty(filterUserId)) {
            UData = {
              wd: Trim.trim(this.state.searchUg),
              assignUser: filterUserId,
              type: status.status2 === 0 && status.status3 === 1 ? 1 : 0,
              orgId: this.props.orgId,
              filterRule: this.props.filterRule,
              reassign: this.props.reassign ? this.props.ressignAndCountersign ? 0 : 1 : 0
            }
          } else {
            UData = {
              wd: Trim.trim(this.state.searchUg),
              type: status.status2 === 0 && status.status3 === 1 ? 1 : 0,
              orgId: this.props.orgId,
              filterRule: this.props.filterRule,
              reassign: this.props.reassign ? this.props.ressignAndCountersign ? 0 : 1 : 0
            }
          }
          delayQuery(() => {
            axios.post(API.query_group_and_users, UData).then(data => {
              const ugData = this.setSelectedData(selectedData, data)
              this.setState({ ugData })
            })
          })
        } else {
          delayQuery(() => {
            this.filiterUserId(false, false, true, false)
          })
        }
      }
      if (this.state.searchUser !== prevState.searchUser) {
      // 人员
        if (Trim.trim(this.state.searchUser)) {
          const filterUserId = []
          // this.props.filterUser 过滤筛选的用户
          !_.isEmpty(this.props.filterUser) && this.props.filterUser.forEach(item => {
            filterUserId.push(item.userId)
          })
          // 用户组数据
          let UserData = null
          if (!_.isEmpty(filterUserId)) {
            UserData = {
              wd: Trim.trim(this.state.searchUser),
              assignUser: filterUserId,
              orderType: this.state.orderType,
              orgId: this.props.orgId,
              filterRule: this.props.filterRule,
              reassign: this.props.reassign ? this.props.ressignAndCountersign ? 0 : 1 : 0
            }
          } else {
            UserData = {
              wd: Trim.trim(this.state.searchUser),
              orderType: this.state.orderType,
              orgId: this.props.orgId,
              filterRule: this.props.filterRule,
              reassign: this.props.reassign ? this.props.ressignAndCountersign ? 0 : 1 : 0
            }
          }
          delayQuery(() => {
            axios.post(API.query_user_with_ticket_num, UserData).then(data => {
              const filterUser = this.setSelectedData(selectedData, data.list)
              this.setState({ filterUser, queryCount: data.count, pageNum: 2 })
            })
          })
        } else {
          delayQuery(() => {
            this.filiterUserId(false, false, false, true)
          })
        }
      }
      if (this.state.orderType !== prevState.orderType) {
      // 待办工单 排序
        const filterUserId = []
        // this.props.filterUser 过滤筛选的用户
        !_.isEmpty(this.props.filterUser) && this.props.filterUser.forEach(item => {
          filterUserId.push(item.userId)
        })
        // 用户组数据
        let UserData = null
        if (!_.isEmpty(filterUserId)) {
          UserData = {
            assignUser: filterUserId,
            wd: this.state.searchUser,
            pageNum: 1,
            pageSize: this.state.pageSize,
            orderType: this.state.orderType,
            orgId: this.props.orgId,
            filterRule: this.props.filterRule,
            reassign: this.props.reassign ? this.props.ressignAndCountersign ? 0 : 1 : 0
          }
        } else {
          UserData = {
            wd: this.state.searchUser,
            pageNum: 1,
            pageSize: this.state.pageSize,
            orderType: this.state.orderType,
            orgId: this.props.orgId,
            filterRule: this.props.filterRule,
            reassign: this.props.reassign ? this.props.ressignAndCountersign ? 0 : 1 : 0
          }
        }
        axios.post(API.query_user_with_ticket_num, UserData).then(data => {
          const filterUser = this.setSelectedData(selectedData, data.list)
          this.setState({ filterUser, queryCount: data.count, pageNum: 2 })
        })
      }
    }

    // 组织机构条件
    conditionOrg = (item, item1) => {
      return (item.id && item.id === item1.id) || (item.userId && item.userId === item1.userId)
    }

    // 用户组条件
    conditionUg = (item, item1) => {
      return (item.groupId && item.groupId === item1.groupId) || (item.userId && item.userId === item1.userId)
    }

    // 已选择的条件
    conditionSelected = (item, item1) => {
      return (item.id && item.id === item1.id) || (item.userId && item.userId === item1.userId) || (item.groupId && item.groupId === item1.groupId)
    }

    // 部门条件
    conditionDep = (item, item1) => {
      return item.id && item.id === item1.id
    }

    // 组条件
    conditionGro = (item, item1) => {
      return item.groupId && item.groupId === item1.groupId
    }

    // 人员条件
    conditionPer = (item, item1) => {
      return item.userId && item.userId === item1.userId
    }

    // 选中时，给它加个 selected
    changeDataList = (item, flag) => {
      const { orgData, ugData, selectedData, opt, filterUser } = this.state
      const { status1, status2, status3 } = this.state.status
      // 选中的 是组织机构 列表
      if (flag === 'org') { // 在组织机构 界面 选择
        !_.isEmpty(orgData) && orgData.map(item1 => {
          if (opt === 0) {
            if (this.conditionOrg(item, item1)) {
              item1.selected = true
              selectedData.push(item1)
              // 用户组数据 需要 选中
              ugData.map(item2 => {
                if (item.userId && item.userId === item2.userId) {
                  item2.selected = true
                }
              })
              // 用户 数据 需要 选中
              !_.isEmpty(filterUser) && filterUser.map(item2 => {
                if (item.userId && item.userId === item2.userId) {
                  item2.selected = true
                }
              })
            }
          } else {
          // 单选条件下
            if (status1 === 0) {
              orgData.map(item1 => {
                if (this.conditionDep(item, item1)) {
                  selectedData.splice(0, 1, item1)
                  item1.selected = true
                  item1.opt = 0
                } else {
                  item1.opt = 1
                }
              })
            }
            if (status2 === 0) {
              ugData.map(item1 => {
                if (this.conditionGro(item, item1)) {
                  selectedData.splice(0, 1, item1)
                  item1.selected = true
                  item1.opt = 0
                } else {
                  item1.opt = 1
                }
              })
            }
            if (status3 === 0) {
              orgData.map(item1 => {
                if (this.conditionPer(item, item1)) {
                  selectedData.splice(0, 1, item1)
                  item1.selected = true
                  item1.opt = 0
                } else {
                  item1.opt = 1
                }
              })
              ugData.map(item1 => {
                if (this.conditionPer(item, item1)) {
                  item1.selected = true
                  item1.opt = 0
                } else {
                  item1.opt = 1
                }
              })
              filterUser.map(item1 => {
                if (this.conditionPer(item, item1)) {
                  selectedData.splice(0, 1, item1)
                  item1.selected = true
                  item1.opt = 0
                } else {
                  item1.opt = 1
                }
              })
            }
          }
        })
        this.setState({
          orgData,
          ugData,
          selectedData,
          filterUser
        })
      } else if (flag === 'ug') { // 在用户组界面 选择
        if (opt === 0) {
          !_.isEmpty(ugData) && ugData.map(item1 => {
            if (this.conditionUg(item, item1)) {
              item1.selected = true
              selectedData.push(item1)
              // 组织机构 数据 需要 选中
              orgData.map(item2 => {
                if (item.userId && item.userId === item2.userId) {
                  item2.selected = true
                }
              })
              // 用户 数据 需要 选中
              filterUser.map(item2 => {
                if (item.userId && item.userId === item2.userId) {
                  item2.selected = true
                }
              })
            }
          })
        } else {
        // =单选 条件下
          if (status1 === 0) {
            orgData.map(item1 => {
              if (this.conditionDep(item, item1)) {
                selectedData.splice(0, 1, item1)
                item1.selected = true
                item1.opt = 0
              } else {
                item1.opt = 1
              }
            })
          }
          if (status2 === 0) {
            ugData.map(item1 => {
              if (this.conditionGro(item, item1)) {
                selectedData.splice(0, 1, item1)
                item1.selected = true
                item1.opt = 0
              } else {
                item1.opt = 1
              }
            })
          }
          if (status3 === 0) {
            orgData.map(item1 => {
              if (this.conditionPer(item, item1)) {
                item1.selected = true
                item1.opt = 0
              } else {
                item1.opt = 1
              }
            })
            ugData.map(item1 => {
              if (this.conditionPer(item, item1)) {
                selectedData.splice(0, 1, item1)
                item1.selected = true
                item1.opt = 0
              } else {
                item1.opt = 1
              }
            })
            filterUser.map(item1 => {
              if (this.conditionPer(item, item1)) {
                selectedData.splice(0, 1, item1)
                item1.selected = true
                item1.opt = 0
              } else {
                item1.opt = 1
              }
            })
          }
        }
        this.setState({
          orgData,
          ugData,
          selectedData,
          filterUser
        })
      } else { // 在用户 界面 选择
        if (opt === 0) {
        // 多选条件
          !_.isEmpty(filterUser) && filterUser.map(item1 => {
            if (this.conditionUg(item, item1)) {
              item1.selected = true
              selectedData.push(item1)
              // 组织机构数据 需要 选中
              orgData.map(item2 => {
                if (item.userId && item.userId === item2.userId) {
                  item2.selected = true
                }
              })
              // 用户组数据 需要 选中
              ugData.map(item2 => {
                if (item.userId && item.userId === item2.userId) {
                  item2.selected = true
                }
              })
            }
          })
        } else {
        // =单选 条件下
          if (status1 === 0) {
            orgData.map(item1 => {
              if (this.conditionDep(item, item1)) {
                selectedData.splice(0, 1, item1)
                item1.selected = true
                item1.opt = 0
              } else {
                item1.opt = 1
              }
            })
          }
          if (status2 === 0) {
            ugData.map(item1 => {
              if (this.conditionGro(item, item1)) {
                selectedData.splice(0, 1, item1)
                item1.selected = true
                item1.opt = 0
              } else {
                item1.opt = 1
              }
            })
          }
          if (status3 === 0) {
            orgData.map(item1 => {
              if (this.conditionPer(item, item1)) {
                item1.selected = true
                item1.opt = 0
              } else {
                item1.opt = 1
              }
            })
            ugData.map(item1 => {
              if (this.conditionPer(item, item1)) {
                selectedData.splice(0, 1, item1)
                item1.selected = true
                item1.opt = 0
              } else {
                item1.opt = 1
              }
            })
            filterUser.map(item1 => {
              if (this.conditionPer(item, item1)) {
                selectedData.splice(0, 1, item1)
                item1.selected = true
                item1.opt = 0
              } else {
                item1.opt = 1
              }
            })
          }
        }
        this.setState({
          orgData,
          ugData,
          selectedData,
          filterUser
        })
      }
    }

    // 删除当前项
    handleDelItem = item => {
      const { orgData, ugData, selectedData, filterUser } = this.state
      const { status1, status2, status3 } = this.state.status
      let newSelectedData = []
      newSelectedData = selectedData.filter(item1 => {
        if (item.id && item.id !== item1.id) {
          return item1
        } else if (item.groupId && item.groupId !== item1.groupId) {
          return item1
        } else if (item.userId && item.userId !== item1.userId) {
          return item1
        }
      })
      if (status1 === 0) {
        orgData.map(item1 => {
          if (this.conditionDep(item, item1)) {
            item1.selected = false
            item1.opt = 0
          } else {
            item1.opt = 0
          }
        })
      }
      if (status2 === 0) {
        ugData.map(item1 => {
          if (this.conditionGro(item, item1)) {
            item1.selected = false
            item1.opt = 0
          } else {
            item1.opt = 0
          }
        })
      }
      if (status3 === 0) {
        orgData.map(item1 => {
          if (this.conditionPer(item, item1)) {
            item1.selected = false
            item1.opt = 0
          } else {
            item1.opt = 0
          }
        })
        ugData.map(item1 => {
          if (this.conditionPer(item, item1)) {
            item1.selected = false
            item1.opt = 0
          } else {
            item1.opt = 0
          }
        })
        filterUser.map(item1 => {
          if (this.conditionPer(item, item1)) {
            item1.selected = false
            item1.opt = 0
          } else {
            item1.opt = 0
          }
        })
      }
      this.setState({ ugData, orgData, filterUser, selectedData: newSelectedData })
    }

    // 点击下一级
    handleEnterItem = (item, flag) => {
      const { selectedData, crumbUG } = this.state
      if (flag === 'org') {
        this.filiterUserId(item.id, true, false, false, item)
      // crumbOrg.push({ id: item.id, name: item.name })
      } else {
        let data = null
        const userIdArry = []
        // this.props.filterUser 过滤筛选的用户
        !_.isEmpty(this.props.filterUser) && this.props.filterUser.forEach(item => {
          userIdArry.push(item.userId)
        })
        if (!_.isEmpty(userIdArry)) {
          data = {
            groupId: item.groupId,
            pageNum: 1,
            pageSize: 10000,
            assignUser: userIdArry,
            orgId: this.props.orgId,
            filterRule: this.props.filterRule,
            reassign: this.props.reassign ? this.props.ressignAndCountersign ? 0 : 1 : 0
          }
        // data = qs.stringify(filter , { indices: false });
        } else {
          data = {
            groupId: item.groupId,
            pageNum: 1,
            pageSize: 10000,
            orgId: this.props.orgId,
            filterRule: this.props.filterRule,
            reassign: this.props.reassign ? this.props.ressignAndCountersign ? 0 : 1 : 0
          }
        }
        // 用户组下 请求人
        axios.post(API.query_users_by_group_id, data).then(data => {
          const userGroup = [].concat([], data.list ? data.list : [])
          const ugData = this.setSelectedData(selectedData, userGroup)
          this.setState({ ugData })
        })
        crumbUG.push({ id: item.groupId, name: item.groupName })
      }
    }

    // 点击面包屑
    handleCrumb = (id, index, flag) => {
      const { crumbOrg, crumbUG } = this.state
      if (flag === 'org') {
        this.filiterUserId(id, true, false, false)
        crumbOrg.splice(index + 1)
      } else {
        this.filiterUserId(id, false, true, false)
        crumbUG.splice(index + 1)
      }
    }

    // 点击全部添加 (只有在多选条件下 ，才会有 全部添加)
    handleAddAll = flag => {
      const { orgData, ugData, filterUser, selectedData } = this.state
      const { status1, status2, status3 } = this.state.status
      const orgDataCopy = _.filter(orgData, item => item.disabled === 0) || []
      const ugDataCopy = _.filter(ugData, item => item.disabled === 0) || []
      const filterUserCopy = _.filter(filterUser, item => item.disabled === 0) || []
      if (flag === 'org') {
        if (status1 === 0) {
          orgDataCopy.map(item => {
            if (item.id && !item.selected) {
              item.selected = true
              selectedData.push(item)
            }
          })
        }
        if (status3 === 0) {
          orgDataCopy.map(item => {
            if (item.userId && !item.selected) {
              item.selected = true
              selectedData.push(item)
              ugDataCopy.map(item1 => {
                if (item.userId === item1.userId && !item1.selected) {
                  item1.selected = true
                }
              })
              filterUserCopy.map(item1 => {
                if (item.userId === item1.userId && !item1.selected) {
                  item1.selected = true
                }
              })
            }
          })
        }
        this.setState({ selectedData })
      } else if (flag === 'ug') {
        if (status2 === 0) {
          ugDataCopy.map(item => {
            if (item.groupId && !item.selected) {
              item.selected = true
              selectedData.push(item)
            }
          })
        }
        if (status3 === 0) {
          ugDataCopy.map(item => {
            if (item.userId && !item.selected) {
              item.selected = true
              selectedData.push(item)
              orgDataCopy.map(item1 => {
                if (item.userId === item1.userId && !item1.selected) {
                  item1.selected = true
                }
              })
              filterUserCopy.map(item1 => {
                if (item.userId === item1.userId && !item1.selected) {
                  item1.selected = true
                }
              })
            }
          })
        }
        this.setState({ selectedData })
      } else {
        if (status3 === 0) {
          filterUserCopy.map(item => {
            if (item.userId && !item.selected) {
              item.selected = true
              selectedData.push(item)
              orgDataCopy.map(item1 => {
                if (item.userId === item1.userId && !item1.selected) {
                  item1.selected = true
                }
              })
              ugDataCopy.map(item1 => {
                if (item.userId === item1.userId && !item1.selected) {
                  item1.selected = true
                }
              })
            }
          })
        }
        this.setState({ selectedData })
      }
    }

    // 全部移除
    handleRemoveAll = () => {
      const { orgData, ugData, filterUser } = this.state
      const { status1, status2, status3 } = this.state.status
      if (status1 === 0) {
        orgData.map(item => {
          if (item.id && item.selected) {
            item.selected = false
            item.opt = 0
          } else {
            item.opt = 0
          }
        })
      }
      if (status2 === 0) {
        ugData.map(item => {
          if (item.groupId && item.selected) {
            item.selected = false
            item.opt = 0
          } else {
            item.opt = 0
          }
        })
      }
      if (status3 === 0) {
        orgData.map(item => {
          if (item.userId && item.selected) {
            item.selected = false
            item.opt = 0
          } else {
            item.opt = 0
          }
        })
        ugData.map(item => {
          if (item.userId && item.selected) {
            item.selected = false
            item.opt = 0
          } else {
            item.opt = 0
          }
        })
        filterUser.map(item => {
          if (item.userId && item.selected) {
            item.selected = false
            item.opt = 0
          } else {
            item.opt = 0
          }
        })
      }
      this.setState({ orgData, ugData, filterUser, selectedData: [] })
    }

    // 搜索
    handleSearch = (val, flag) => {
    // 分组织机构和用户组
      if (flag === 'org') {
        this.setState({
          clearOrgX: !!val,
          crumbOrg: val ? [] : [{
            name: i18n('organization', '组织机构'),
            id: 0
          }],
          searchOrg: val
        })
      } else if (flag === 'ug') {
        this.setState({
          clearUgX: !!val,
          crumbUG: val ? [] : [{
            name: i18n('organization', '组织机构'),
            id: 0
          }],
          searchUg: val
        })
      } else {
        this.setState({
          clearUserX: !!val,
          searchUser: val
        })
      }
    }

    // 清除 搜索
    handleClearX = flag => {
      if (flag === 'org') {
        this.setState({
          clearOrgX: false,
          crumbOrg: [{
            name: i18n('organization', '组织机构'),
            id: 0
          }],
          searchOrg: ''
        })
      } else if (flag === 'ug') {
        this.setState({
          clearUgX: false,
          crumbUG: [{
            name: i18n('user_group', '用户组'),
            id: 0
          }],
          searchUg: ''
        })
      } else {
        this.setState({
          clearUserX: false,
          searchUser: ''
        })
      }
    }

    // 点击排序
    onHandleUp =() => {
      const { orderType } = this.state
      if (orderType === 1) {
        this.setState({ orderType: null })
      } else {
        this.setState({ orderType: 1 })
      }
    }

    onHandleDown = () => {
      const { orderType } = this.state
      if (orderType === 0) {
        this.setState({ orderType: null })
      } else {
        this.setState({ orderType: 0 })
      }
    }

    // 滚动加载
    handleScroll = e => {
      const pageNum = this.state.pageNum
      let scrollTop = 0
      let scrollHeight = 0
      let offsetHeight = 0
      if (this.state.bro === 'FF') {
        scrollTop = e.target.scrollTop
        scrollHeight = e.target.scrollHeight
        offsetHeight = e.target.offsetHeight
      } else {
        scrollTop = e.srcElement.scrollTop
        scrollHeight = e.srcElement.scrollHeight
        offsetHeight = e.srcElement.offsetHeight
      }

      const { queryCount, pageSize, searchUser } = this.state
      const count = (pageNum - 1) * pageSize

      if (scrollTop + 40 > scrollHeight - offsetHeight && queryCount > count) {
        const filterUserId = []
        // log("this.props.filterUser", this.props.filterUser)
        // this.props.filterUser 过滤筛选的用户
        !_.isEmpty(this.props.filterUser) && this.props.filterUser.forEach(item => {
          filterUserId.push(item.userId)
        })
        // 人员 数据
        let UserData = null
        if (!_.isEmpty(filterUserId)) {
          UserData = {
            assignUser: filterUserId,
            wd: searchUser,
            pageNum: pageNum,
            pageSize: pageSize,
            orderType: this.state.orderType,
            orgId: this.props.orgId,
            filterRule: this.props.filterRule,
            reassign: this.props.reassign ? this.props.ressignAndCountersign ? 0 : 1 : 0
          }
        } else {
          UserData = {
            wd: searchUser,
            pageNum: pageNum,
            pageSize: pageSize,
            orderType: this.state.orderType,
            orgId: this.props.orgId,
            filterRule: this.props.filterRule,
            reassign: this.props.reassign ? this.props.ressignAndCountersign ? 0 : 1 : 0
          }
        }
        this.loadMore = false
        axios.post(API.query_user_with_ticket_num, UserData).then(data => {
          _.map(data.list, n => {
            let t = true
            _.map(this.state.filterUser, user => {
              if (n.userId !== undefined && n.userId === user.userId) {
                t = false
              }
            })
            if (t) {
              this.state.filterUser.push(n)
            }
          })
          // this.pageNum++;
          const filterUser = this.setSelectedData(this.state.selectedData, this.state.filterUser)
          this.setState({ filterUser, pageNum: pageNum + 1 })
        })
      }
    }

    // 点击取消弹窗
    handleCancel = () => {
      this.props.onCancel()
    }

    // 点击提交按钮
    handleOk = () => {
      const { selectedData } = this.state
      selectedData.map(item => {
        delete item.opt
        delete item.selected
      })
      this.props.onOk(selectedData)
    }

    render () {
      const { orgData, ugData, selectedData, crumbOrg, crumbUG, status, opt, assign } = this.state
      return (
        <div className={`choose-modal ${this.props.type}`}>
          <h3>{this.props.title}</h3>
          <div className="choose-user">
            <div className="user-tabs">
              <Tabs defaultActiveKey={assign === 1 ? '0' : '1'} onChange={this.hanleTabChange}>
                {/* 用户 （在有选择指定的人员范围时，才会显示，如：创建工单，选择处理人时；其他选择用户时就不显示了） */}
                {
                  status.status3 === 0 &&
                  <TabPane tab={i18n('user', '用户')} key="0">
                    <User
                      filterUser={this.state.filterUser}
                      selectedData={selectedData}
                      changeDataList={this.changeDataList}
                      handleDelItem={this.handleDelItem}
                      handleAddAll={this.handleAddAll}
                      handleRemoveAll={this.handleRemoveAll}
                      handleSearch={this.handleSearch}
                      handleClearX={this.handleClearX}
                      onHandleUp={this.onHandleUp}
                      onHandleDown={this.onHandleDown}
                      orderType={this.state.orderType}
                      clearX={this.state.clearUserX}
                      search={this.state.searchUser}
                      status={status}
                      ressignAndCountersign={this.props.ressignAndCountersign || 0}
                      opt={opt}
                      ref={inst => {
                        this.refuser = inst
                      }}
                    />
                  </TabPane>
                }
                {/* 组织结构 */}
                {status.status1 !== 1 && <TabPane tab={i18n('organization', '组织机构')} key="1">
                  <Organization
                    orgData={orgData}
                    selectedData={selectedData}
                    changeDataList={this.changeDataList}
                    handleDelItem={this.handleDelItem}
                    handleEnterItem={this.handleEnterItem}
                    crumbOrg={crumbOrg}
                    handleCrumb={this.handleCrumb}
                    handleAddAll={this.handleAddAll}
                    handleRemoveAll={this.handleRemoveAll}
                    handleSearch={this.handleSearch}
                    handleClearX={this.handleClearX}
                    clearX={this.state.clearOrgX}
                    search={this.state.searchOrg}
                    status={status}
                    ressignAndCountersign={this.props.ressignAndCountersign || 0}
                    opt={opt} />
                </TabPane>}
                {/* 用户组 */}

                {
                  status.status2 === 0 &&
                  <TabPane tab={i18n('user_group', '用户组')} key="2">
                    <UserGroup
                      ugData={ugData}
                      selectedData={selectedData}
                      changeDataList={this.changeDataList}
                      handleDelItem={this.handleDelItem}
                      handleEnterItem={this.handleEnterItem}
                      crumbUG={crumbUG}
                      handleCrumb={this.handleCrumb}
                      handleAddAll={this.handleAddAll}
                      handleRemoveAll={this.handleRemoveAll}
                      handleSearch={this.handleSearch}
                      handleClearX={this.handleClearX}
                      clearX={this.state.clearUgX}
                      search={this.state.searchUg}
                      status={status}
                      type={this.props.type}
                      ressignAndCountersign={this.props.ressignAndCountersign || 0}
                      opt={opt} />
                  </TabPane>
                }
              </Tabs>
            </div>
          </div>
          <div className="footer">
            <Button onClick={this.handleOk} type="primary">{i18n('globe.submit', '提交')}</Button>
            <Button onClick={this.handleCancel}>{i18n('cancel', '取消')}</Button>
          </div>
        </div>
      )
    }
}
