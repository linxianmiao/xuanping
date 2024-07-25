import React from 'react'
import { inject, observer } from 'mobx-react'
import { Button, Input, Modal, message } from '@uyun/components'
import { PlusOutlined } from '@uyun/icons'
import CreateNode from './createNode'

@inject('nodeStore')
@observer
class ButtonWrap extends React.Component {
  state = {
    kw: undefined
  }

  onSubmit = () => {
    this.createNode.props.form.validateFields(async (errors, values) => {
      if (errors) return false
      const res = await this.props.nodeStore.saveNodeName(values)
      if (+res === 200) {
        this.props.nodeStore.getNodeList()
        const tip = values.id
          ? i18n('ticket.kb.edit.success', '编辑成功')
          : i18n('ticket.kb.success', '创建成功')
        message.success(tip)
        this.props.onCancel()
      }
    })
  }

  render() {
    const { editData, visible, changeVisible, onCancel } = this.props
    const kw = this.state.kw || this.props.nodeStore.kw

    return (
      <div className="bottom_wrap">
        <Input.Search
          style={{ width: '256px' }}
          allowClear
          value={kw}
          enterButton
          onChange={(e) => this.setState({ kw: e.target.value })}
          onSearch={() => this.props.handleSearch(this.state.kw)}
          onClear={() => this.setState({ kw: undefined }, () => this.props.handleSearch(undefined))}
          placeholder={i18n('globe.keywords', '请输入关键字')}
        />
        <Button
          type="primary"
          style={{ float: 'right' }}
          onClick={changeVisible}
          icon={<PlusOutlined />}
        >
          {i18n('create_node_name', '添加节点')}
        </Button>
        {visible ? (
          <Modal
            title={
              editData.id
                ? i18n('edit_node_name', '编辑节点')
                : i18n('create_node_name', '添加节点')
            }
            visible={visible}
            onCancel={onCancel}
            onOk={this.onSubmit}
          >
            <CreateNode
              wrappedComponentRef={(node) => {
                this.createNode = node
              }}
              editData={editData}
            />
          </Modal>
        ) : null}
      </div>
    )
  }
}
export default ButtonWrap
