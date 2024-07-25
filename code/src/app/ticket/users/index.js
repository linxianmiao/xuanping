
/**
 * visible 控制弹框的展示与隐藏
 * tabs 将要开启的tab的栏， 有顺序 { 1 -user - 人员 , 0-group - 用户组 , 2-department - 部门 , 3-role - 角色 , 4-rota - 值班 , 5-variable - 变量}
 * defaultTab 默认选中的tab ，可不传，默认人员
 * selects 默认选择的人员，用户组等
 * isUseVariable 当变量有值时，是否仅选择变量值作为处理人  默认false
 * isShowUserVariable 是否展示仅选择变量值作为处理人  默认false
 * selectsType 控制单选与多选 ， key为 tab的项 ，value为单选和多选 ， 默认多选
 * loading 加载状态
 */
import React, { Component } from 'react'
import { toJS } from 'mobx'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import { Modal, Spin } from '@uyun/components'
import Header from './header'
import TabSelect from './tabs'
import { SELECTS } from './config'
import './styles/index.less'
import './styles/userSystem.less'

@observer
class Users extends Component {
    state = {
      tab: this.props.defaultTab || '1'
    }

    onChangeTabs = tab => {
      const { query } = this.props.TicketUserStore
      this.setState({ tab }, () => {
        this.props.TicketUserStore.setQuery(this.state.tab, { ...query[this.state.tab], kw: '', pageNo: 1, groupId: undefined, departId: undefined }, 'replace')
        this.props.handleSearch({ ...query[this.state.tab], kw: '', groupId: undefined, departId: undefined, pageNo: 1 })
      })
    }

    handleOk = (e) => {
      e.stopPropagation()
      const types = ['id', 'name']
      const { selectUsers, selectGroups, selectDepartments, selectRoles, selectRotas, selectVariables, isUseVariable } = toJS(this.props.TicketUserStore)
      const obj = {
        1: this.handleClean(selectUsers, types),
        0: this.handleClean(selectGroups, types),
        2: this.handleClean(selectDepartments, types),
        3: this.handleClean(selectRoles, types),
        4: this.handleClean(selectRotas, types),
        5: this.handleClean(selectVariables, types)
      }
      this.props.handleOk(_.pick(obj, this.props.tabs), isUseVariable)
    }

    // 格式化数据
    handleClean = (list, types) => _.map(list, data => _.pick(data, types))

    onCancel = (e) => {
      e.stopPropagation()
      this.props.handleCancel()
    }

    handleAfterClose = () => {
      this.setState({ tab: '1' })
      this.props.TicketUserStore.distory()
    }

    componentDidMount () {
      const selects = this.props.selects || SELECTS
      _.map(selects, (val, key) => {
        this.props.TicketUserStore.setSelects(key, val)
      })
      this.props.TicketUserStore.setUseVariable(this.props.isUseVariable || false)
      this.props.url && this.props.TicketUserStore.setUrl(this.props.url)
      const { groupSelectUserList, departSelectUsertList } = toJS(this.props.TicketUserStore)
    }

    componentWillReceiveProps (nextProps) {
      if (nextProps.visible !== this.props.visible && nextProps.visible) {
        const selects = nextProps.selects || SELECTS
        this.setState({ tab: nextProps.defaultTab })
        _.map(selects, (val, key) => {
          this.props.TicketUserStore.setSelects(key, val)
        })
      }
    }

    componentWillUnmount () {
      this.props.TicketUserStore.distory()
    }

    render () {
      const dilver = {
        ...this.props,
        tab: this.state.tab,
        onChangeTabs: this.onChangeTabs
      }
      return (
        <Modal
          width={680}
          visible={this.props.visible}
          onOk={this.handleOk}
          onCancel={this.onCancel}
          afterClose={this.handleAfterClose}
          wrapClassName="ticket-new-user-modal"
          title={this.props.title || i18n('ticket-new-user-title', '人员选择')}>
          <div className="ticket-user-system-wrap">
            <Spin spinning={!!this.props.loading}>
              <Header {...dilver} />
              <TabSelect {...dilver} />
            </Spin>
          </div>
        </Modal>
      )
    }
}
Users.propTypes = {
  visible: PropTypes.bool.isRequired,
  tabs: PropTypes.array.isRequired,
  handleOk: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleSearch: PropTypes.func.isRequired,
  isShowUserVariable: PropTypes.bool
}
export default Users
