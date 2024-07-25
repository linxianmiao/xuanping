import React from 'react'
import { Popover, Tag, Tooltip, Collapse } from '@uyun/components'
import { TeamOutlined } from '@uyun/icons'
import UserNameWithTip from '~/ticket/log/UserNameWithTip'
import FormItem from '../components/formItem'
import UserContent from '~/details/BasicInfo/UserContent'
import classnames from 'classnames'
const Panel = Collapse.Panel

class ExcutorAndGroup extends React.Component {
  state = {
    pageNum: 1,
    pageSize: 20,
    userList: [],
    groupId: '',
    count: 0,
    canLoad: true,
    alertDetailVisible: false, // 告警详情侧滑
    counterSignUserAndGroups: []
  }
  onVisibleChange = (visible, id) => {
    if (visible) {
      this.setState(
        {
          groupId: id,
          pageNum: 1
        },
        () => {
          this.getUserByGroupId()
        }
      )
    } else {
      this.setState({
        groupId: '',
        userList: []
      })
    }
  }
  handleCounterIconClick = async () => {
    if (this.state.counterSignUserAndGroups.length === 0) {
      const { caseId, tacheId } = this.props.forms
      const params = { caseId, activityId: tacheId }
      const res = await axios.get(API.queryCounterSignUserAndGroups, { params })

      this.setState({
        counterSignUserAndGroups: res || []
      })
    }
  }
  changeGroup = (id) => {
    this.setState(
      {
        groupId: id,
        pageNum: 1,
        userList: []
      },
      () => {
        this.getUserByGroupId()
      }
    )
  }

  getUserByGroupId = () => {
    this.setState({
      canLoad: false
    })
    const { pageNum, pageSize, groupId } = this.state
    const data = {
      groupId,
      pageNum,
      pageSize
    }
    if (groupId) {
      axios.get(API.get_users_by_group_id, { params: data }).then((res) => {
        if (data.pageNum !== 1) {
          this.setState({
            canLoad: true,
            count: res.count,
            pageNum: pageNum + 1,
            userList: [...this.state.userList, ...res.list]
          })
        } else {
          this.setState({
            canLoad: true,
            count: res.count,
            pageNum: pageNum + 1,
            userList: res.list
          })
        }
      })
    }
  }

  handleScroll = (e) => {
    const { count, pageNum, pageSize, canLoad } = this.state
    let scrollTop = 0
    let scrollHeight = 0
    let offsetHeight = 0
    scrollTop = e.srcElement.scrollTop
    scrollHeight = e.srcElement.scrollHeight
    offsetHeight = e.srcElement.offsetHeight
    if (
      offsetHeight + scrollTop + 100 >= scrollHeight &&
      (pageNum - 1) * pageSize <= count &&
      canLoad
    ) {
      this.timer && clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.getUserByGroupId()
      }, 500)
    }
  }

  render() {
    const { fieldMinCol, field, formLayoutType, source } = this.props
    const { userList } = this.state
    const { userGroupList, allUserInfos, currexcutor, isCountersign } = this.props.forms || {}
    const users = _.filter(
      allUserInfos,
      (userInfo) => (currexcutor || '').indexOf(userInfo.userId) > -1
    )
    const userAndGroup = [...(userGroupList || []), ...(users || [])]
    const customPanelStyle = {
      borderRadius: 4,
      marginBottom: 0,
      border: 0
    }
    const isTicketField = field.type === 'ticketField'
    if (source === 'formset') {
      return (
        <FormItem
          fieldMinCol={fieldMinCol}
          field={field}
          className={classnames({
            'table-style-item': formLayoutType,
            'ticket-field': isTicketField
          })}
        >
          <Tag>管理员</Tag>
        </FormItem>
      )
    }
    return (
      <FormItem
        fieldMinCol={fieldMinCol}
        field={field}
        className={classnames({
          'table-style-item': formLayoutType,
          'ticket-field': isTicketField
        })}
      >
        {_.map(userAndGroup, (item, index) => {
          if (index < 2) {
            // 有userId是用户
            return item.userId ? (
              // <Tooltip
              //   placement="bottomRight"
              //   key={item.userId}
              //   title={
              //     <p>
              //       {item.userName} :  {_.compact([item.department, item.mobilePhone, item.email]).join('  |  ')}
              //     </p>
              //   }
              // >
              //   <Tag >{item.userName}</Tag >
              // </Tooltip>
              <UserNameWithTip user={item} />
            ) : (
              <Popover
                trigger="click"
                placement="bottom"
                overlayClassName="popoverClass"
                key={item.id}
                onVisibleChange={(visible) => {
                  this.onVisibleChange(visible, item.id)
                }}
                content={<UserContent userList={userList} handleScroll={this.handleScroll} />}
              >
                <Tag className="group-tag">{item.name}</Tag>
              </Popover>
            )
          } else if (index === 2) {
            return (
              <Tooltip
                overlayClassName="collapseContent"
                placement="bottomLeft"
                key={item.id || item.userId}
                trigger="click"
                onVisibleChange={(visible) => {
                  if (!visible) {
                    this.setState({ userList: [] })
                  }
                }}
                title={
                  <Collapse accordion onChange={this.changeGroup}>
                    {_.map(userAndGroup, (item, ind) => {
                      if (ind > 1) {
                        return item.userId ? (
                          <React.Fragment key={item.userId}>
                            <div style={{ padding: '0 10px' }}>
                              <i className="iconfont icon-idcard iClass" />
                              <span className="userNameClass">{item.userName}：</span>
                              {item.department && (
                                <span className="userNameClass">
                                  {item.department} <span className="userNameContent" />
                                </span>
                              )}
                              {item.mobilePhone && (
                                <span className="userNameClass">
                                  {item.mobilePhone}
                                  {item.email && <span className="userNameContent" />}
                                </span>
                              )}
                              {item.email && <span className="userNameClass">{item.email}</span>}
                            </div>
                          </React.Fragment>
                        ) : (
                          <Panel header={item.name} key={item.id} style={customPanelStyle}>
                            <UserContent userList={userList} handleScroll={this.handleScroll} />
                          </Panel>
                        )
                      }
                    })}
                  </Collapse>
                }
              >
                <Tag className="group-tag">...</Tag>
              </Tooltip>
            )
          }
        })}
        {isCountersign === 1 && (
          <Tooltip
            title={
              <div>
                <div>当前会签人/组:</div>
                {this.state.counterSignUserAndGroups.map((item) => item.name).join(', ')}
              </div>
            }
            onVisibleChange={(v) => {
              if (v) {
                this.handleCounterIconClick()
              }
            }}
          >
            <TeamOutlined style={{ cursor: 'pointer' }} />
          </Tooltip>
        )}
      </FormItem>
    )
  }
}

export default ExcutorAndGroup
