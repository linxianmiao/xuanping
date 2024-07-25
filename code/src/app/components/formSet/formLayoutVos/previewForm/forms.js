import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import { getAndvalidateFields } from '~/components/formSet/logic'
import TicketForms from '~/ticket/forms'

@inject('formSetGridStore')
@withRouter
@observer
class Forms extends Component {
  state = {
    forms: {}
  }

  setForms = async () => {
    const { currentGrid, simpleTemplates } = this.props.formSetGridStore
    const forms = toJS(currentGrid)
    let fieldList = []
    let subformScript = []
    try {
      fieldList = await getAndvalidateFields(forms.formLayoutVos)
    } catch (e) {
      console.log(e)
    }

    const formLayoutVos = forms.formLayoutVos.reduce((acc, cur) => {
      if (cur.type === 'subForm' && cur.mode === 0) {
        const { relatedTemplateId, hidden } = cur
        const currentSubForm = _.find(simpleTemplates, (item) => item.id === relatedTemplateId) || {
          formLayoutVos: [],
          fieldList: []
        }
        _.forEach(currentSubForm.formLayoutVos, (item) => {
          item.hidden = hidden
        })
        const {
          formLayoutVos: subFormLayoutVos,
          fieldList: subFormFields,
          combineCustomScript
        } = currentSubForm
        fieldList = [...fieldList, ...subFormFields]
        if (!_.isEmpty(combineCustomScript)) {
          subformScript = [...subformScript, combineCustomScript]
        }

        return [...acc, ...subFormLayoutVos]
      } else {
        return [...acc, cur]
      }
    }, [])
    this.setState({
      forms: _.assign({}, forms, {
        fields: fieldList,
        formLayoutVos,
        subformScript: _.compact(subformScript)
      })
    })
  }

  componentDidMount() {
    this.setForms()
  }

  render() {
    const { forms } = this.state
    const { currentGrid } = this.props.formSetGridStore
    const { formLayoutType } = currentGrid
    return _.isEmpty(forms) ? null : (
      <TicketForms
        type="preview"
        forms={forms}
        location={this.props.location}
        formLayoutType={formLayoutType}
        source="formset"
      />
    )
  }
}
export default Forms
