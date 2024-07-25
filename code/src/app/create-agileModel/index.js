import React, { Component } from 'react'
import { Provider } from 'mobx-react'
import { BasicInfo } from '../model/component'
// import ProcessSet from './processSet'
import PageHeader from '~/components/pageHeader'
import ErrorBoundary from '~/components/ErrorBoundary'
import BasicInfoStore from '../model/store/basicInfoStore'
import FieldListStore from '../model/store/fieldListStore'
import UserStore from '../ticket-list/stores/userStore'
import SelectUserStore from '../model/store/selectUserStore'
import SelectGroupsStore from '../model/store/selectGroupsStore'

const basicInfoStore = new BasicInfoStore()
const fieldListStore = new FieldListStore()
const selectUserStore = new SelectUserStore()
const selectGroupsStore = new SelectGroupsStore()
const userStore = new UserStore()

export default class AgileModel extends Component {
  state = {
    tacheList: [
      {
        name: '新建模型',
        description: '',
        policy: 4,
        counterSign: 0,
        userAndGroupList: [],
        fieldList: [],
        builtin: 0,
        isEditing: 0,
        defaultButton: true,
        submitName: '提交并完成工单',
        dealRules: [],
        type: 0,
        parallelismActivityVos: undefined,
        key: '1'
      }
    ]
  }

  componentDidMount() {
    basicInfoStore.getLayoutsList() // 获取模型分组列表
  }

  render() {
    const dilver = {
      modelData: {},
      saveBasicInfo: this.saveBasicInfo,
      modelType: 0
    }
    return (
      <Provider
        basicInfoStore={basicInfoStore}
        fieldListStore={fieldListStore}
        userStore={userStore}
        selectUserStore={selectUserStore}
        selectGroupsStore={selectGroupsStore}
      >
        <div className="config-main edit-page">
          <PageHeader />
          <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
            <BasicInfo
              {...dilver}
              wrappedComponentRef={(inst) => {
                this.basicinfo = inst
              }}
            />
          </ErrorBoundary>
          {/* <ProcessSet
            tacheList={this.state.tacheList} /> */}
        </div>
      </Provider>
    )
  }
}
