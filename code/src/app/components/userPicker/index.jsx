import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import UserPickerModal from './userPickerModal'
import UserPickSelect from './userPickerSelect'
import ApproveModel from './ApproveModel'
import { StoreProvider, ArrayToObject, ObjectToArray } from './config'

@inject('userPickStore')
@observer
class UserPicker extends Component {
  static defaultProps = {
    selectionType: 'checkbox', // 'checkbox'/'radio' 控制人员组件的多选/单选
    tabs: [0, 1, 2, 3, 4, 5, 6], // 0:用户组 1:人员 2:部门 3:角色 4:值班 5:变量 6:矩阵 7:跨租户用户 8:跨租户用户组 控制人员组件展示的tab项
    mode: undefined, // 组件的展示方式，默认为弹框展示支持所有的tab; 'select'为下拉展示方式，仅支持人员和用户组
    size: 'default', // 组件的大小
    useVariable: false, // 仅在变量的时用，控制'当变量有值时，仅选择变量值作为处理人'前的checkbox是否选中
    extendFunc: undefined, // ['current] 组件的扩展，目前仅支持在组件后边加一个button，点击以后会出现当前用户等
    method: 'get', // 组件的请求方式，组件会根据method的类型走对应得接口； get | post ；默认为get ； 仅在流程中提交选人的时候为post ;
    readOnlyClass: 'tag', // 只读状态下的展示方式  默认标签tag 选择框 select
    /**
     * value  value为数组，存在两种情况， A [''] ; B [{id:'' , name:'' , type:''}] ;
     * A 的情况为老数据，组件已经增加了兼容，可以根据id获取的具体的信息，但是需要上层传递的tabs的数组长度必须为1
     */
    isString: false, // 上层需要的数据格式，默认为false， 即为B的数据格式
    onChange: () => {}, // value改变时触发，如果value传递的方式为A ,返回的方式也按照A来返回，传递的为B模式，则按照B的模式返回
    /**
     *  extendQuery  人员组件的额外搜索条件   object , 默认空，可能有的值如下，三者不共存
     *  { modelId }   变量的时候用，用到变量的时候为流程图选人的时候   method 为get时生效
     *  { fieldCode } 表单中的人员组件用，可以根据字段那里配置的人员范围进行搜索   method 为get时生效
     *  { ticketId, modelId, flowId, handleType, tacheId, caseId, form } 流程中提交选人得时候用； 仅在method为post时生效
     */

    mutex: false, // 不同tab下的选项是否互斥
    zIndex: null, // 弹框z-index
    modalTitle: '' // 弹窗名称
  }

  state = {
    value: { all: [] }
  }

  componentDidMount() {
    if (Object.prototype.toString.call(this.props.value) === '[object Object]') {
      this.initValueObj()
    } else {
      this.initValue()
    }
  }

  componentDidUpdate(prevProps) {
    if (!_.isEqual(prevProps.value, this.props.value)) {
      if (Object.prototype.toString.call(this.props.value) === '[object Object]') {
        this.initValueObj()
      } else {
        this.initValue()
      }
    }
  }

  initValueObj = async () => {
    const { value: valueInProps = {}, tabs } = this.props

    let user = []
    let group = []
    if (valueInProps?.user) {
      user = await this.props.userPickStore.getUserList(valueInProps?.user, 1)
    }
    if (valueInProps?.group) {
      group = await this.props.userPickStore.getGroupList(valueInProps?.group, 0)
    }
    this.setState({
      value: ArrayToObject([...user, ...group])
    })
  }

  initValue = async () => {
    const { value: valueInProps = [], tabs } = this.props
    let list = [...valueInProps]
    // 判断value是不是仅id，如果仅id则需要通过请求获取名称,一般上仅id的仅有一种类型，可以用tab进行区分
    const isString = _.some(list, (item) => typeof item === 'string')
    if (isString && tabs.length === 1) {
      switch (tabs[0]) {
        case 0:
          list = await this.props.userPickStore.getGroupList(list, tabs[0])
          break
        case 1:
          list = await this.props.userPickStore.getUserList(list, tabs[0])
          break
        case 2:
          list = await this.props.userPickStore.getDepartList(list, tabs[0])
          break
        case 7:
          list = await this.props.userPickStore.getCrossUnitUsersAndGroups(null, tabs[0])
          break
        default:
          break
      }
    }

    this.setState({
      value: ArrayToObject(list)
    })
  }

  /**
   * 调用父组件的onchange更新数据
   * 但是itsm老数据用的是数组，平台提供的组件时对象，需要将其转化
   */
  onChange = (obj, useVariable) => {
    this.setState({ value: obj })
    // isString 父组件需要的数据格式
    if (this.props.isString) {
      this.props.onChange(
        _.map(ObjectToArray(obj), (item) => item.id),
        useVariable
      )
    } else {
      this.props.onChange(ObjectToArray(obj), useVariable)
    }
  }

  render() {
    const { value } = this.state
    // prosp传递下来的value已经转为state的value，为了避免歧义，在此过滤掉
    const {
      value: _,
      onChange,
      useVariable,
      mutex,
      selectionType,
      zIndex,
      modalTitle,
      ...props
    } = this.props
    return (
      <StoreProvider value={{ props }}>
        <div>
          {props.mode === 'select' ? (
            <UserPickSelect
              value={value}
              id={props.id}
              isRequired={props.isRequired}
              selectionType={selectionType}
              showTypes={this.props.showTypes}
              onChange={this.onChange}
            />
          ) : (
            <UserPickerModal
              zIndex={zIndex}
              id={props.id}
              isRequired={props.isRequired}
              mutex={mutex}
              modalTitle={modalTitle}
              selectionType={selectionType}
              value={value}
              useVariable={useVariable}
              onChange={this.onChange}
              showTypes={this.props.showTypes}
            />
          )}
        </div>
      </StoreProvider>
    )
  }
}

export default UserPicker
