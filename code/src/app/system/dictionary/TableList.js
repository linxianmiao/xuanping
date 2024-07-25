import React, { createRef } from 'react'
import { observer, inject } from 'mobx-react'
import { toJS } from 'mobx'
import { store as runtimeStore } from '@uyun/runtime-react'
import { Table, Input, Button, Modal, message, InputNumber } from '@uyun/components'
import UserPicker from '~/components/userPicker'
import AddModal from './AddModal'
import dictionaryStore from './store/dictionaryStore'
import { orLowcode } from '~/utils/common'

const Search = Input.Search

@inject('globalStore')
@observer
export default class TableList extends React.Component {
  state = {
    visible: false,
    isEdit: false,
    selectedRowKeys: [],
    dicDetail: {},
    editingDict: {}, // 用于扩展值
    extandData: [],
    curActiveSort: undefined
  }

  userPickerBtnRef = createRef()
  sortRef = createRef()

  componentDidMount() {
    dictionaryStore.init()
    dictionaryStore.queryDictionaryData()
  }

  onSearch = _.debounce((e) => {
    const params = {
      page_num: 1,
      kw: e
    }
    dictionaryStore.queryDictionaryData(params)
  }, 1000)

  onShowMadal = (visible, record) => {
    this.setState({
      visible,
      isEdit: !_.isEmpty(record),
      dicDetail: record
    })
  }

  onSelect = (selectedRowKeys) => {
    this.setState({
      selectedRowKeys
    })
  }

  onDelete = () => {
    const { selectedRowKeys } = this.state
    Modal.confirm({
      title: i18n('dic-delete-title', '您确认要移除选择内容吗？'),
      content: i18n('dic-delete-content', '删除字典将无法恢复'),
      okText: i18n('remove'),
      onOk: () => {
        dictionaryStore.deleteDictionaryData(selectedRowKeys).then((res) => {
          if (res) {
            message.success(i18n('delete_success'))
          }
        })
      }
    })
  }

  queryExtendData = async (record) => {
    this.setState({ extandData: [], editingDict: record })

    if (record.extendNums === 0) {
      setTimeout(() => {
        this.userPickerBtnRef.current.click()
      })
      return
    }

    const params = { dicDataId: record.id }
    const res = (await axios.get(API.queryDictionaryDataExtend, { params })) || []

    this.setState(
      {
        extandData: res.map((item) => ({
          id: item.value,
          name: item.name,
          type: item.type
        }))
      },
      () => {
        this.userPickerBtnRef.current.click()
      }
    )
  }

  // 扩展值
  handleExtendChange = (value, record) => {
    // 前后两次打开前都是空的话，会造成状态不变，userpicker不更新，前一次的选中状态保留到后一次
    // 所以这里选择完后更新一下状态
    this.setState({ extandData: value })

    const dictionaryDataExtends = value.map((item) => ({
      name: item.name,
      value: item.id,
      type: item.type
    }))

    const url = `${API.updateDictionaryDataExtend}?dicDataId=${record.id}&currentVersion=${record.version}`
    axios.post(url, dictionaryDataExtends).then((res) => {
      if (res) {
        message.success(i18n('update_success'))
        dictionaryStore.queryDictionaryData()
      }
    })
  }

  onTableChange = (pageNo, pageSize) => {
    dictionaryStore.queryDictionaryData({ page_num: pageNo, page_size: pageSize })
  }

  sortClick = (record) => {
    this.setState({ curActiveSort: record.id }, () => {
      this.sortRef.current && this.sortRef.current.focus()
    })
  }

  pressEnter = (record, e) => {
    if (e.keyCode === 13 && e.target.value && typeof Number(e.target.value) === 'number') {
      this.sortBlur(record, e)
    }
  }

  sortBlur = (record, e) => {
    const reg = /^[0-9]*$/
    this.setState({ curActiveSort: undefined })
    if (e.target.value === '') {
      return
    }
    const sort = Number(e.target.value)
    if (sort !== record.sort && reg.test(Math.abs(sort))) {
      const paramList = {
        id: record.id,
        dicCode: record.dicCode,
        name: record.name,
        value: record.value,
        description: record.description,
        version: record.version,
        sort
      }
      dictionaryStore.updateDictionaryData(paramList).then((res) => {
        if (res) {
          message.success(i18n('update_success'))
          // this.props.form.resetFields()
          this.props.onShowMadal(false)
        }
      })
    }
  }

  render() {
    const { skin } = this.props
    const { visible, isEdit, dicDetail, selectedRowKeys, editingDict, extandData, curActiveSort } =
      this.state
    const { dictionaryInsert, dictionaryDelete, dictionaryModify } =
      this.props.globalStore.configAuthor
    const { dicData, total, items } = dictionaryStore

    const columns = [
      {
        title: i18n('name'),
        dataIndex: 'name',
        width: '20%',
        render: (value, record) => {
          if (orLowcode(dictionaryModify)) {
            return <a onClick={() => this.onShowMadal(true, record)}>{value}</a>
          } else {
            return value
          }
        }
      },
      {
        title: i18n('dictionary-value', '值'),
        dataIndex: 'value',
        width: '30%'
      },
      {
        title: '扩展属性',
        dataIndex: 'extendNums',
        width: '15%',
        render: (extendNums, record) => {
          return (
            <a
              onClick={() => {
                this.queryExtendData(record)
              }}
            >
              {extendNums}
            </a>
          )
        }
      },
      {
        title: '排序',
        dataIndex: 'sort',
        width: '15%',
        render: (sort, record) => {
          if (curActiveSort !== record.id) {
            return (
              <a onClick={() => this.sortClick(record)}>{typeof sort === 'number' ? sort : '--'}</a>
            )
          } else {
            return (
              <InputNumber
                ref={this.sortRef}
                style={{ width: '90%' }}
                min={-99999}
                max={99999}
                step={1}
                defaultValue={sort}
                size="small"
                onKeyDown={(e) => this.pressEnter(record, e)}
                onBlur={(e) => this.sortBlur(record, e)}
              />
            )
          }
        }
      },
      {
        title: i18n('dictionary-description', '说明'),
        dataIndex: 'description',
        width: '20%',
        render: (text) => text || '--'
      }
    ]
    const pagination = {
      current: items.page_num,
      pageSize: items.page_size,
      total,
      onShowSizeChange: (current, pageSize) => this.onTableChange(1, pageSize),
      onChange: this.onTableChange
    }
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelect,
      getCheckboxProps: (record) => ({
        disabled: record.linkNum > 0
      })
    }

    const { headerHeight } = runtimeStore.getState()

    return (
      <div className="table-list">
        <div className="header">
          <Search
            onChange={(e) => this.onSearch(e.target.value)}
            allowClear
            onClear={(e) => this.onSearch()}
            style={{ width: 200 }}
            placeholder={i18n('input_keyword')}
          />
          <>
            {orLowcode(dictionaryDelete) && (
              <Button onClick={this.onDelete} disabled={_.isEmpty(selectedRowKeys)}>
                {i18n('multi_remove')}
              </Button>
            )}
            {orLowcode(dictionaryInsert) && (
              <Button type="primary" onClick={() => this.onShowMadal(true)}>
                {'添加属性'}
              </Button>
            )}
          </>
        </div>
        <Table
          dataSource={toJS(dicData)}
          columns={columns}
          pagination={pagination}
          rowSelection={rowSelection}
          rowKey="id"
          // scroll={{ y: `calc(100vh - ${(skin === 'blue' ? 269 : 295) + headerHeight}px)` }}
        />
        <AddModal
          visible={visible}
          isEdit={isEdit}
          dicDetail={dicDetail}
          onShowMadal={this.onShowMadal}
        />
        <UserPicker
          mode="custom"
          tabs={[0, 1, 2]}
          showTypes={['groups', 'users', 'departs_custom']}
          value={extandData}
          onChange={(v) => this.handleExtendChange(v, editingDict)}
        >
          <div ref={this.userPickerBtnRef} />
        </UserPicker>
      </div>
    )
  }
}
