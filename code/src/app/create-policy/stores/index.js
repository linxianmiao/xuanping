import policyStore from './policyStore'
import basicStore from './basicStore'
import TriggerStore from '../../trigger/store/indexStore'
import createDefinitionStore from '../../create-definition/stores/createDefinitionStore'
export default {
  policyStore,
  basicStore,
  createDefinitionStore,
  triggerStore: new TriggerStore()
}
