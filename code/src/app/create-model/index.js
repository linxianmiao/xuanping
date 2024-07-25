import React, { Component } from 'react'
import { BasicInfo } from '../model/component'
import Footer from './footer'
import PageHeader from '~/components/pageHeader'
import ContentLayout from '~/components/ContentLayout'
import BasicInfoStore from '../model/store/basicInfoStore'
import FieldListStore from '../model/store/fieldListStore'
import UserStore from '../ticket-list/stores/userStore'
import SelectUserStore from '../model/store/selectUserStore'
import SelectGroupsStore from '../model/store/selectGroupsStore'
import ErrorBoundary from '~/components/ErrorBoundary'
import getURLParam from '~/utils/getUrl'

import { Provider } from 'mobx-react'

const basicInfoStore = new BasicInfoStore()
const fieldListStore = new FieldListStore()
const selectUserStore = new SelectUserStore()
const selectGroupsStore = new SelectGroupsStore()
const userStore = new UserStore()
class CreateModel extends Component {
  componentDidMount() {
    window.LOWCODE_APP_KEY = getURLParam('appkey')
  }
  componentWillUnmount() {
    window.LOWCODE_APP_KEY = ''
  }
  saveBasicInfo = (callback) => {
    this.basicinfo.props.form.validateFields((errors, values) => {
      if (errors) {
        return false
      }

      const { key: code, label: name } = _.get(values, 'modelTypeVo')
      values.childModel = values.childModel ? 1 : 0
      values.layoutId = values.layoutVos.key

      callback(
        _.assign(
          {
            modelTypeVo: { code, name },
            mode: 1
          },
          _.omit(values, ['modelIcon', 'layoutVos', 'modelTypeVo']),
          values.modelIcon
        )
      )
    })
  }

  render() {
    const dilver = {
      saveBasicInfo: this.saveBasicInfo
    }
    return (
      <Provider
        basicInfoStore={basicInfoStore}
        fieldListStore={fieldListStore}
        userStore={userStore}
        selectUserStore={selectUserStore}
        selectGroupsStore={selectGroupsStore}
      >
        <div className="new-itsm-create-model-wrap">
          {!window.LOWCODE_APP_KEY && <PageHeader />}
          {window.LOWCODE_APP_KEY ? (
            <ErrorBoundary desc={i18n('loadFail')}>
              <BasicInfo
                {...dilver}
                wrappedComponentRef={(inst) => {
                  this.basicinfo = inst
                }}
              />
              <Footer {...dilver} />
            </ErrorBoundary>
          ) : (
            <ContentLayout>
              <ErrorBoundary desc={i18n('loadFail')}>
                <BasicInfo
                  {...dilver}
                  wrappedComponentRef={(inst) => {
                    this.basicinfo = inst
                  }}
                />
                <Footer {...dilver} />
              </ErrorBoundary>
            </ContentLayout>
          )}
        </div>
      </Provider>
    )
  }
}

export default CreateModel
