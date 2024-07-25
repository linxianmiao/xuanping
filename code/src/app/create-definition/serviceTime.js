import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { PlusOutlined } from '@uyun/icons'
import { Select, Divider, Modal, message } from '@uyun/components'
import CreateServiceTime from './createServiceTime'
import './styles/createServiceTime.less'
const Option = Select.Option

@inject('createDefinitionStore', 'globalStore')
@observer
class Submit extends Component {
  state = {
    visible: false,
    id: ''
  }

  showCreateOrUpdate = (id) => {
    if (id) {
      const { timePolicyList } = this.props.createDefinitionStore
      const timePolicy = _.find(timePolicyList, (timePolicy) => timePolicy.id === id)
      if (_.isEmpty(timePolicy)) {
        message.error(i18n('w80012', '服务时间策略不存在'))
        this.props.onChange(undefined)
        return false
      }
      this.props.createDefinitionStore.timePolicy = timePolicy
    } else {
      this.props.createDefinitionStore.timePolicy = {
        name: undefined,
        work_day: [],
        holiday: [],
        include_day: [],
        holidayDataSourceType: 'itsm'
      }
    }

    this.setState({ visible: true, id })
  }

  handleCreateOrUpdate = (id) => {
    this.props.onChange(id)
    this.setState({ visible: false, id: '' })
  }

  handleDel = (id, e) => {
    e.stopPropagation()
    Modal.confirm({
      title: i18n('create-definition-serviceTime-delete-tip', '您是否确认要删除该服务时间'),
      onOk: () => {
        this.props.createDefinitionStore.deleteTimePolicy(id).then((res) => {
          if (res === '200') {
            // 删除当前选中的项，讲输入框中的选项清空
            if (id === this.props.value) {
              this.props.onChange(undefined)
            }
          }
        })
      },
      onCancel() {}
    })
  }

  render() {
    const { timePolicyList } = this.props.createDefinitionStore
    const { slaModify, slaInsert, slaDelete } = this.props.globalStore.configAuthor
    const { value, placeholder, disabled, ...other } = this.props
    const { visible, id } = this.state
    return (
      <React.Fragment>
        <Select
          {...other}
          disabled={disabled}
          onChange={this.props.onChange}
          value={value}
          placeholder={placeholder}
          className="calc-100-50"
          dropdownRender={(menus) => (
            <div>
              {menus}
              {slaInsert && (
                <React.Fragment>
                  <Divider style={{ margin: '4px 0' }} />
                  <div
                    onMouseDown={() => {
                      this.showCreateOrUpdate()
                    }}
                    style={{ padding: '8px', cursor: 'pointer' }}
                  >
                    <PlusOutlined /> {i18n('create-definition-add-service-time', '新建服务时间')}
                  </div>
                </React.Fragment>
              )}
            </div>
          )}
        >
          {_.map(timePolicyList, (timePolicy) => {
            return (
              <Option key={timePolicy.id} value={timePolicy.id}>
                <div className="time-policy-select-list-item">
                  <span>{timePolicy.name}</span>
                  {slaDelete && (
                    <i
                      onClick={(e) => {
                        this.handleDel(timePolicy.id, e)
                      }}
                      className="iconfont icon-shanchu"
                    />
                  )}
                </div>
              </Option>
            )
          })}
        </Select>
        {value && slaModify && (
          <a
            style={{ paddingLeft: 20 }}
            onClick={() => {
              this.showCreateOrUpdate(value)
            }}
          >
            {i18n('config', '配置')}
          </a>
        )}
        <CreateServiceTime
          id={id}
          visible={visible}
          onSuccess={this.handleCreateOrUpdate}
          onCancel={() => this.setState({ visible: false, id: '' })}
        />
      </React.Fragment>
    )
  }
}

export default Submit
