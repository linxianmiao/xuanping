import React, { Component, createRef } from 'react'
import { observer, inject } from 'mobx-react'
import { Table, Button, Modal, message, InputNumber } from '@uyun/components'
import LazySelect from '~/components/lazyLoad/lazySelect'
import UserPicker from '~/components/userPicker'
import EditModal from './EditModal'
import dictionaryStore from '../store/dictionaryStore'
import { findNodeById } from '../logic'
import { orLowcode } from '~/utils/common'

@inject('globalStore')
@observer
export default class CascadeTable extends Component {
  static defaultProps = {
    dictCode: ''
  }

  state = {
    data: [],
    visible: false,
    editingDict: {}, // 用于编辑、扩展值
    extandData: [], // 扩展值数据
    expandedRowKeys: [],
    selectedFilterDict: undefined,
    curActiveSort: undefined
  }

  userPickerBtnRef = createRef()
  sortRef = createRef()

  componentDidMount() {
    this.query()
  }

  componentDidUpdate(prevProps) {
    const { dictCode } = this.props
    if (dictCode !== prevProps.dictCode) {
      this.setState({ expandedRowKeys: [], selectedFilterDict: undefined })
      this.query()
    }
  }

  // 查询列表，需要传入父节点，默认查询顶级列表
  query = async (parentDict = {}) => {
    const { dictCode } = this.props
    const params = {
      dicCode: dictCode,
      parentId: parentDict.id
    }
    let res = (await axios.get(API.queryCascadeDictionaryData, { params })) || []
    res = res.map((item) => ({
      ...item,
      children: item.hasChildren ? item.children || [] : undefined
    }))

    let nextData = this.state.data.slice()
    const parent = findNodeById(nextData, parentDict.id)

    if (parent) {
      parent.children = res.length > 0 ? res : undefined
    } else {
      nextData = res
      dictionaryStore.queryDicTypeLists()
    }

    this.setState({ data: nextData })
  }

  queryOneNode = async (id) => {
    const params = {
      dicDataId: id
    }
    const res = (await axios.get(API.queryCascadeFullDictionaryData, { params })) || []

    // 获取每个节点的id，这里只会存在一条分支
    const ids = []
    let node = res[0]

    while (node) {
      ids.push(node.id)
      node = node.children ? node.children[0] : null
    }

    this.setState({ data: res, expandedRowKeys: ids })
  }

  queryByKw = async (query, callback) => {
    const { dictCode } = this.props
    const params = {
      page_num: query.pageNo,
      page_size: query.pageSize,
      kw: query.kw
    }
    const res = (await axios.get(API.queryDictionaryData(dictCode), { params })) || {}
    let list = res.list || []
    list = list.map((item) => ({ id: item.id, name: item.name }))
    callback(list)
  }

  queryExtendData = async (record) => {
    this.setState({ extandData: [], editingDict: record })

    if (record.extendNums === 0) {
      this.userPickerBtnRef.current.click()
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

  handleEdit = (dict = {}) => {
    this.setState({
      visible: true,
      editingDict: dict
    })
  }

  handleEditSuccess = () => {
    const { editingDict, data } = this.state
    const { parentId } = editingDict
    const parent = parentId ? findNodeById(data, parentId) : undefined

    this.setState({
      visible: false,
      editingDict: {}
    })
    this.query(parent)
    this.setState({ expandedRowKeys: parentId ? [parentId] : [] })
  }

  handleDelete = (record) => {
    Modal.confirm({
      title: '确认要删除当前属性吗?',
      content: '删除后数据不可恢复，确定要删除吗?',
      okText: i18n('remove'),
      onOk: () => {
        axios.post(`${API.deleteCascadeDictionaryData}?dicDataId=${record.id}`).then((res) => {
          if (res) {
            message.success('删除成功')
            this.query({ id: record.parentId })
            this.setState({ expandedRowKeys: record.parentId ? [record.parentId] : [] })
          }
        })
      }
    })
  }

  // 扩展值
  handleExtendChange = (value, record) => {
    const dictionaryDataExtends = value.map((item) => ({
      name: item.name,
      value: item.id,
      type: item.type
    }))

    const url = `${API.updateDictionaryDataExtend}?dicDataId=${record.id}&currentVersion=${record.version}`
    axios.post(url, dictionaryDataExtends).then((res) => {
      if (res) {
        message.success(i18n('update_success'))
        this.query({ id: record.parentId })
        this.setState({ expandedRowKeys: record.parentId ? [record.parentId] : [] })
      }
    })
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
    this.setState({ curActiveSort: undefined })
    if (e.target.value === '') {
      return
    }
    const sort = Number(e.target.value)
    const reg = /^[0-9]*$/
    if (sort !== record.sort && reg.test(Math.abs(sort))) {
      const paramList = {
        id: record.id,
        dicCode: record.dictCode,
        name: record.name,
        value: record.value,
        description: record.description,
        version: record.version,
        parentId: record.parentId,
        dictionaryDataExtends: record.dictionaryDataExtends,
        sort
      }
      axios.post(API.updateDictionaryData, paramList).then((res) => {
        if (res) {
          message.success(i18n('update_success'))
          // this.props.form.resetFields()
          this.handleEditSuccess()
          this.query(record)
        }
      })
    }
  }

  render() {
    const { dictionaryInsert, dictionaryModify } = this.props.globalStore.configAuthor
    const { dictCode } = this.props
    const {
      data,
      visible,
      editingDict,
      extandData,
      expandedRowKeys,
      selectedFilterDict,
      curActiveSort
    } = this.state

    const columns = [
      {
        title: i18n('name'),
        dataIndex: 'name',
        width: 200,
        render: (value, record) => {
          if (orLowcode(dictionaryModify)) {
            return <a onClick={() => this.handleEdit(record)}>{value}</a>
          } else {
            return value
          }
        }
      },
      {
        title: i18n('dictionary-value', '值'),
        dataIndex: 'value',
        width: 200
      },
      {
        title: '排序',
        dataIndex: 'sort',
        width: 100,
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
        render: (text) => text || '--'
      },
      {
        title: '扩展属性',
        dataIndex: 'extendNums',
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
        title: '操作',
        width: 150,
        render: (record) => {
          return (
            <Button.Group type="link">
              <a onClick={() => this.handleEdit({ parentId: record.id })}>添加子属性</a>
              <a onClick={() => this.handleDelete(record)}>删除</a>
            </Button.Group>
          )
        }
      }
    ]

    return (
      <div className="table-list">
        <div className="header">
          <LazySelect
            placeholder={i18n('input_keyword')}
            style={{ width: 200 }}
            labelInValue
            allowClear
            getList={this.queryByKw}
            value={selectedFilterDict}
            onChange={(item) => {
              this.setState({
                selectedFilterDict: item,
                expandedRowKeys: []
              })

              if (item) {
                this.queryOneNode(item.key)
              } else {
                this.query()
              }
            }}
          />
          <>
            {orLowcode(dictionaryInsert) && (
              <Button type="primary" onClick={() => this.handleEdit()}>
                {'添加属性'}
              </Button>
            )}
          </>
        </div>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          pagination={false}
          expandedRowKeys={expandedRowKeys}
          onExpand={(expanded, record) => {
            if (expanded && (!record.children || record.children.length === 0)) {
              this.query(record)
            }

            let nextExpandedRowKeys = [...expandedRowKeys]
            if (expanded) {
              nextExpandedRowKeys.push(record.id)
            } else {
              nextExpandedRowKeys = nextExpandedRowKeys.filter((id) => id !== record.id)
            }
            this.setState({ expandedRowKeys: nextExpandedRowKeys })
          }}
        />

        <EditModal
          visible={visible}
          dictCode={dictCode}
          dict={editingDict}
          onSuccess={this.handleEditSuccess}
          onCancel={() => {
            this.setState({
              visible: false,
              editingDict: {}
            })
          }}
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
