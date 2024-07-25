import React, { Component } from 'react'
import { Modal } from '@uyun/components'
import { observer, inject } from 'mobx-react'
import Header from './header'
import SlothList from './SlothList'
import LayoutTickets from './layoutTicekts'
import ModelList from './ModelList'
import './styles/index.less'
/**
 *  showFollow    是否展示收藏 默认 true
 *  mode          选择方式   link | select    点击跳转url页面 | 点击选中  默认link
 *  selectList    选中的模型列表   仅 mode=select 时生效
 *  showFooter    是否显示modal显示的footer ， 默认false
 */

@inject('modelListStore', 'globalStore')
@observer
class CreateModals extends Component {
  static defaultProps = {
    showFollow: true,
    mode: 'link',
    selectList: [],
    showFooter: false
  }

  state = {
    tab: 'tabA'
  }

  componentDidMount() {
    const { mode } = this.props
    this.props.modelListStore.getModelShowType()

    if (mode === 'link' && this.props.globalStore.grantedApp.catalog) {
      this.props.globalStore.getConfig().then(openType => {
        this.setState({
          tab: openType[0] !== '1' && openType[1] === '1' ? 'tabB' : 'tabA'
        })
      })
    }
  }

  handleChangeTab = tab => {
    this.setState({ tab })
  }

  render () {
    const { isShowModelsByGroups } = this.props.modelListStore // 控制创建工单模型的展示方式
    const { openType } = this.props.globalStore // 控制创建工单模型的展示方式
    const {
      visible,
      selectList,
      mode = 'link',
      showFollow = true,
      showFooter = false
    } = this.props
    const { tab } = this.state
    const dilver = {
      mode,
      showFollow,
      selectList: selectList || [],
      handleChange: this.props.handleChange,
      handleChangeSelectList: this.props.handleChangeSelectList
    }
    const modalProps = showFooter ? {} : { footer: null }
    return (
      <React.Fragment>
        <Modal
          width={864}
          destroyOnClose
          visible={visible}
          wrapClassName="create-ticket-modal-wrap"
          title={<Header mode={mode} tab={tab} handleChangeTab={this.handleChangeTab} openType={openType} />}
          onCancel={() => { this.props.handleChange(false) }}
          onOk={() => { this.props.handleChange(false, 'ok') }}
          {...modalProps}
        >
          {!isShowModelsByGroups && tab === 'tabA' && <ModelList {...dilver} />}
          {isShowModelsByGroups && tab === 'tabA' && <LayoutTickets {...dilver} />}
          {tab === 'tabB' && <SlothList {...dilver} />}
        </Modal>
      </React.Fragment>
    )
  }
}
export default CreateModals
