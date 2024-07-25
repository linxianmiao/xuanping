import React, { Component } from 'react'
import { toJS } from 'mobx'
import { Input, Button, Form, Tooltip } from '@uyun/components'
import { PlusOutlined } from '@uyun/icons'
import CopyInput from '../components/cpoyInput'
import uuidv4 from '~/utils/uuid'
import HTML5Backend from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import DargTabs from './dargTabs'
const FormItem = Form.Item

class Tabs extends Component {
  state = {
    newRender: false
  }

  componentDidUpdate(prevProps) {
    // 添加选项卡时保持滚动条滑到底部
    if (toJS(this.props.sideData.tabs).length > toJS(prevProps.sideData.tabs).length) {
      this.scrollToBottom()
    }
  }

  scrollToBottom = () => {
    const form = document.getElementById('tabs-form')
    if (form) {
      form.scrollIntoView(false)
    }
  }

  addTabs = () => {
    const { tabs } = this.props.sideData
    const nextTabs = tabs.slice()
    const length = nextTabs.length
    nextTabs.push({
      id: uuidv4(),
      name: `${i18n('ticket.relateTicket.tab', '标签页')}${length + 1}`,
      fieldList: []
    })
    this.props.handleChange({
      tabs: nextTabs
    })
  }

  handleDelTab = (idx) => {
    let { tabs } = this.props.sideData
    const codes = _.map(tabs[idx].fieldList, (field) => field.code)
    tabs = _.filter(tabs, (tab, index) => index !== idx)
    this.props.handleChange({ tabs }, { codes })
  }

  // 重新排序
  moveSort = (dragIndex, hoverIndex) => {
    const { tabs } = this.props.sideData
    const list = tabs.slice()
    const tmp = list[dragIndex]
    list.splice(dragIndex, 1)
    list.splice(hoverIndex, 0, tmp)

    this.props.handleChange({
      tabs: list
    })
  }

  // 重新render
  newRenderFn = () => {
    this.setState({
      newRender: !this.state.newRender
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form
    const { tabs, description } = this.props.sideData
    const length = tabs.length
    return (
      <DndProvider backend={HTML5Backend}>
        <Form id="tabs-form" layout="vertical">
          {_.map(tabs, (item, idx) => {
            return (
              <DargTabs
                key={item.id}
                index={idx}
                item={item}
                newRender={this.state.newRender}
                moveSort={this.moveSort}
                newRenderFn={this.newRenderFn}
                handleDelTab={this.handleDelTab}
                getFieldDecorator={getFieldDecorator}
                length={length}
              />
            )
          })}

          <FormItem>
            <Button
              type="dashed"
              style={{ width: '100%', marginTop: 10 }}
              // disabled={length === 5}
              icon={<PlusOutlined />}
              onClick={this.addTabs}
            >
              {i18n('model.field.eidt.rihgt.add.tab', '添加选项卡')}
            </Button>
            {/* <p className="btn-tips">{i18n('model.field.eidt.rihgt.tab.tip2', '最多支持5个选项')}</p> */}
          </FormItem>

          <FormItem label={i18n('conf.model.field.card.desc', '描述')}>
            {getFieldDecorator('description', {
              initialValue: description
            })(
              <Input.TextArea
                maxLength="500"
                autosize={{ minRows: 2, maxRows: 6 }}
                placeholder={`${i18n('ticket.forms.pinput', '请输入')}${i18n(
                  'conf.model.field.card.desc',
                  '描述'
                )}`}
              />
            )}
          </FormItem>
        </Form>
      </DndProvider>
    )
  }
}

export default Form.create({
  mapPropsToFields: (props) => {
    const { tabs, description } = props.sideData
    return _.reduce(
      tabs,
      (sum, item) => {
        return {
          ...sum,
          [item.id]: Form.createFormField({
            value: item.name
          })
        }
      },
      {
        description: Form.createFormField({
          value: description
        })
      }
    )
  },
  onValuesChange: (props, changedValues, allValues) => {
    let { tabs, description } = props.sideData
    for (const key in changedValues) {
      if (key === 'description') {
        description = changedValues[key]
      } else {
        tabs = _.map(tabs, (tab) => {
          if (tab.id === key) {
            tab.name = changedValues[key]
          }
          return tab
        })
      }
    }
    props.handleChange({
      tabs,
      description
    })
  }
})(Tabs)
