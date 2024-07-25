import React from 'react'
import { observer, inject } from 'mobx-react'
import { store as runtimeStore } from '@uyun/runtime-react'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@uyun/icons'
import { Menu, Modal, Icon, Form, Input, message, Popover, Radio } from '@uyun/components'
import DoubleColumnsLayout from '~/components/ContentLayout/DoubleColumnsLayout'
import AppDataTabs from '~/components/LowcodeLink/AppDataTabs'
import TableList from './TableList'
import CascadeTable from './Cascade/CascadeTable'
import dictionaryStore from './store/dictionaryStore'
import './index.less'
import { getCookie } from '../../utils'
import { orLowcode } from '~/utils/common'

const MenuList = Menu.MenuList
const FormItem = Form.Item
const RadioGroup = Radio.Group
const RadioButton = Radio.Button

@Form.create()
@inject('globalStore')
@observer
class Dictionary extends React.Component {
  state = {
    visible: false,
    isEdit: false,
    dicTypeInfo: {},
    skin: getCookie('skin') || 'white'
  }

  componentDidMount() {
    window.LOWCODE_APP_KEY = this.props.appkey
    dictionaryStore.queryDicTypeLists()
    window.changeSkin_hook_dictionary = () => {
      this.setState({
        skin: getCookie('skin')
      })
    }
  }

  componentWillUnmount() {
    window.LOWCODE_APP_KEY = ''
  }

  onEditDetail = (record) => {
    this.setState({
      visible: true,
      isEdit: true,
      dicTypeInfo: record
    })
  }

  onSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { isEdit, dicTypeInfo } = this.state
        const params = {
          ...values,
          builtin: 0
        }
        if (!isEdit) {
          dictionaryStore.saveDicType(params).then((res) => {
            if (res) {
              message.success(i18n('add-success'))
              this.props.form.resetFields()
              this.onCancel()
            }
          })
        } else {
          params.id = dicTypeInfo.id
          params.version = dicTypeInfo.version
          dictionaryStore.updateDicType(params).then((res) => {
            if (res) {
              message.success(i18n('update_success'))
              this.props.form.resetFields()
              this.onCancel()
            }
          })
        }
      }
    })
  }

  onDelete = (value) => {
    Modal.confirm({
      title: i18n('dic-type-delete-title', { title: value.name }),
      // content: i18n('dic-type-delete-content', '删除后该分组内容将同时移除'),
      okText: i18n('delete'),
      onOk: () => {
        dictionaryStore.deleteDicType().then((res) => {
          if (res) {
            message.success(i18n('delete_success'))
          }
        })
      }
    })
  }

  onSelect = ({ item, key, selectedKeys }) => {
    dictionaryStore.onSelectDicType(key, item.props.item)
  }

  onCheckName = (rule, value, callback) => {
    if (value.lenght <= 0) {
      callback(i18n('ticket.forms.pinputName'))
    } else if (/\s/.test(value)) {
      callback(i18n('conf.model.notblank'))
    }
    callback()
  }

  onCancel = () => {
    this.setState({ visible: false, isEdit: false, dicTypeInfo: {} })
  }

  render() {
    const { getFieldDecorator } = this.props.form
    const { dictionaryInsert, dictionaryDelete, dictionaryModify } =
      this.props.globalStore.configAuthor
    const { dicTypeList, selectedKey, dicCode, dict = {} } = dictionaryStore
    const { visible, isEdit, dicTypeInfo, skin } = this.state
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 13 }
    }

    const inLowcode = !this.props.appIsolation && !!window.LOWCODE_APP_KEY
    const { headerHeight } = runtimeStore.getState()
    const dictContentStyle =
      skin === 'blue'
        ? { height: `calc(100vh - ${119 + headerHeight}px)` }
        : { height: `calc(100vh - ${132 + headerHeight}px)` }

    if (inLowcode) {
      dictContentStyle.height = '100%'
    }

    return (
      <div
        className="dictionary-content"
        style={{ ...dictContentStyle, padding: this.props.appIsolation ? 12 : 0 }}
      >
        {inLowcode && (
          <div style={{ marginBottom: 10 }}>
            <AppDataTabs />
          </div>
        )}

        <DoubleColumnsLayout style={{ height: inLowcode ? 'calc(100% - 42px)' : '100%' }}>
          <DoubleColumnsLayout.Left>
            <MenuList
              showSearch
              bordered
              title={'字典'}
              extra={
                orLowcode(dictionaryInsert) && (
                  <PlusOutlined onClick={() => this.setState({ visible: true })} />
                )
              }
              searchPlaceholder={i18n('input_keyword')}
              selectedKeys={[selectedKey]}
              onSelect={this.onSelect}
            >
              {_.map(dicTypeList, (item) => (
                <Menu.Item
                  key={item.id}
                  item={item}
                  title={item.name}
                  code={item.code}
                  showExtra="hover"
                  extra={
                    !item.builtin && (
                      <span>
                        {orLowcode(dictionaryModify) && (
                          <EditOutlined onClick={() => this.onEditDetail(item)} />
                        )}
                        {orLowcode(dictionaryDelete) &&
                          (item.dataCount > 0 ? (
                            <Popover content={i18n('w15014')}>
                              <DeleteOutlined style={{ cursor: 'default' }} />
                            </Popover>
                          ) : (
                            <DeleteOutlined onClick={() => this.onDelete(item)} />
                          ))}
                      </span>
                    )
                  }
                >
                  {
                    <Popover content={item.name}>
                      <Icon type={item.dataMode === 1 ? 'share-alt' : 'bars'} />
                      {item.name}
                    </Popover>
                  }
                </Menu.Item>
              ))}
            </MenuList>
          </DoubleColumnsLayout.Left>
          <DoubleColumnsLayout.Right className="dictionary-content-right">
            <header>
              <h3>{dict.name || ''}</h3>
            </header>
            <div>
              {dict.dataMode === 0 && <TableList key={dicCode} skin={skin} />}
              {dict.dataMode === 1 && <CascadeTable dictCode={dict.code} />}
            </div>
          </DoubleColumnsLayout.Right>
        </DoubleColumnsLayout>

        <Modal
          title={!isEdit ? '添加字典' : '编辑字典'}
          visible={visible}
          onOk={this.onSubmit}
          onCancel={this.onCancel}
        >
          <Form>
            <FormItem label={i18n('name')} {...formItemLayout}>
              {getFieldDecorator('name', {
                rules: [
                  {
                    required: true,
                    message: i18n('ticket.forms.pinputName')
                  },
                  {
                    validator: this.onCheckName
                  }
                ],
                initialValue: isEdit ? dicTypeInfo.name : ''
              })(<Input placeholder={i18n('ticket.forms.pinputName')} maxLength={32} />)}
            </FormItem>
            <FormItem label={i18n('field_code')} {...formItemLayout}>
              {getFieldDecorator('code', {
                rules: [
                  {
                    required: true,
                    message: i18n('ticket.forms.inputParamCode')
                  },
                  {
                    pattern: /^[a-zA-Z0-9][a-zA-Z0-9_]{0,32}$/,
                    message: i18n('dict-name-limt')
                  }
                ],
                initialValue: isEdit ? dicTypeInfo.code : ''
              })(
                <Input
                  disabled={isEdit}
                  placeholder={i18n('ticket.forms.inputParamCode')}
                  maxLength={32}
                />
              )}
            </FormItem>
            <FormItem label={'类型'} {...formItemLayout}>
              {getFieldDecorator('dataMode', {
                initialValue: isEdit ? dicTypeInfo.dataMode : 0
              })(
                <RadioGroup disabled={isEdit} buttonStyle="solid">
                  <RadioButton value={0}>单层级数据</RadioButton>
                  <RadioButton value={1}>多层级数据</RadioButton>
                </RadioGroup>
              )}
            </FormItem>
          </Form>
        </Modal>
      </div>
    )
  }
}

export default Dictionary
