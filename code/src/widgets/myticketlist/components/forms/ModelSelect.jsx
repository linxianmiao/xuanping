import React, { Component, useState, useEffect, useCallback } from 'react'
import { Form, Select } from '@uyun/components'
import { observer } from 'mobx-react'
import { inject } from '@uyun/core'
import { TicketlistStore } from '../../ticketlist.store'

const FormItem = Form.Item
const Option = Select.Option

function LazyLoadSelect(props) {
  const {
    value,
    onChange,
    placeholder,
    style = {},
    mode,
    labelInValue = true,
    lazy = true,
    allowClear = true,
    disabled
  } = props
  const [list, setList] = useState([])
  const [visible, setVisible] = useState()
  const [canLoad, setCnLoad] = useState(true) // 是否可以继续滚动加载
  const [query, setQuery] = useState({ pageNo: 1, pageSize: 15, kw: '' }) // 下拉列表的筛选条件

  // 初始化，点击下拉框展开的时候加载15条数据
  function onDropdownVisibleChange(visible) {
    setVisible(visible)
    if (visible) {
      setQuery({ pageNo: 1, pageSize: 15, kw: '' })
      setCnLoad(true)
    }
  }
  // 滚动加载
  function onPopupScroll(e) {
    const { scrollTop, scrollHeight, offsetHeight } = e.target
    if (offsetHeight + scrollTop >= scrollHeight && canLoad) {
      setQuery(_.assign({}, query, { pageNo: query.pageNo + 1 }))
    }
  }
  // 下拉列表数据的获取
  function getFilterList() {
    props.getList(query, (res) => {
      setCnLoad(res.length >= query.pageSize)
      if (query.pageNo === 1) {
        setList(res)
      } else {
        setList([...list, ...res])
      }
    })
  }
  // 通过关键字查找
  function onSearch(kw) {
    setQuery(_.assign({}, query, { pageNo: 1, kw }))
  }

  const debounceOnSerach = useCallback(_.debounce(onSearch, 300), []) // 搜索函数

  // 增加一个lazy属性，为false时，会在组件加载时请求数据
  // 用于预设值的场景，防止匹配不了选项
  useEffect(() => {
    if (!lazy) {
      getFilterList()
    }
  }, [])

  // 筛选条件改变的时候触发加载事件
  useEffect(() => {
    if (visible) {
      getFilterList()
    }
  }, [query])

  return (
    <Select
      disabled={disabled}
      allowClear={allowClear}
      showSearch
      labelInValue={labelInValue}
      size="small"
      mode={mode}
      style={style}
      value={value}
      open={visible}
      filterOption={false}
      onChange={onChange}
      placeholder={placeholder}
      onPopupScroll={onPopupScroll}
      onSearch={debounceOnSerach}
      onDropdownVisibleChange={onDropdownVisibleChange}
    >
      {_.map(list, (item) => (
        <Option key={item.id} value={item.id}>
          {item.name}
        </Option>
      ))}
    </Select>
  )
}

@observer
class ModelLazySelect extends Component {
  @inject(TicketlistStore) store
  @inject('i18n') i18n
  state = {
    value: undefined
  }

  getValues = async (props) => {
    const { value, mode } = props
    if (!_.isEmpty(value)) {
      const modelId = mode === 'multiple' ? value.toString() : value
      this.store.getModelsByIds(modelId).then((res) => {
        const value = _.map(res, (item) => ({ key: item.id, label: item.name }))
        if (mode === 'multiple') {
          this.setState({ value })
        } else {
          this.setState({ value: value[0] })
        }
      })
    }
  }

  componentDidMount() {
    this.getValues(this.props)
  }

  getList = async (query, callback) => {
    const { pageSize, pageNo, kw } = query
    let res = (await this.store.getModelList({ pageNum: pageNo, wd: kw, pageSize })) || []
    res = _.map(res, (item) => ({ id: item.id, name: item.name }))
    callback(res)
  }

  onChange = (value) => {
    this.setState({ value: value })
    if (_.isEmpty(value)) {
      this.props.onChange(undefined)
    } else {
      if (this.props.mode === 'multiple') {
        this.props.onChange(_.map(value, (item) => item.key))
      } else {
        this.props.onChange(value.key)
      }
    }
  }

  render() {
    const value = this.props.value ? this.state.value : undefined
    return (
      <LazyLoadSelect
        {...this.props}
        value={value}
        labelInValue
        onChange={this.onChange}
        placeholder={`请选择${this.props.name}`}
        getList={this.getList}
      />
    )
  }
}
export default class ModelSelect extends Component {
  render() {
    const { item, formItemLayout, getFieldDecorator, defaultValue, disabled } = this.props
    return (
      <FormItem label={''} {...formItemLayout}>
        {getFieldDecorator(item.code, {
          initialValue: defaultValue
        })(
          <ModelLazySelect
            mode="multiple"
            disabled={disabled}
            name={item.name}
            style={{ width: '100%' }}
          />
        )}
      </FormItem>
    )
  }
}
