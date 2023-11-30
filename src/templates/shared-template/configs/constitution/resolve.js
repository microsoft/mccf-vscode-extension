function getMemberInfo(memberId) {
  const key = ccf.strToBuf(memberId);
  const value = ccf.kv["public:ccf.gov.members.info"].get(key);
  const info = ccf.bufToJsonCompatible(value);
  return info;
}

// Returns true if the member is a recovery member.
function isRecoveryMember(memberId) {
  const key = ccf.strToBuf(memberId);
  const value =
    ccf.kv["public:ccf.gov.members.encryption_public_keys"].get(key);

  if (value) {
    return true;
  }
  return false;
}

// Defines which of the members are operators.
function isOperator(memberId) {
  // // Operators cannot be recovery members.
  // if (isRecoveryMember(memberId)) {
  //   return false;
  // }
  const info = getMemberInfo(memberId);
  return info.member_data && info.member_data.is_operator;
}

// Defines actions that can be passed with sole operator input.
function canOperatorPass(action) {
  // To enable code upgrades and disaster recovery for Public Preview, we've given the
  // operator member some additional privileges.
  // 1. add/remove node code are required for code upgrades.
  // 2. set_constitution to replace this constitution with a "correct" one easily later on.
  // 3. set_member to add a new member for privileged operations when we use MHSM keys.
  const allowedOperatorActions = [
    "add_node_code", // Remove
    "remove_ca_cert_bundle",
    "remove_jwt_issuer",
    "remove_node",
    "remove_node_code", // Remove
    "remove_service_principal",
    "remove_user",
    "remove_user_by_cert",
    "set_ca_cert_bundle",
    "set_constitution", // Remove
    "set_js_app",
    "set_jwt_issuer",
    "set_jwt_public_signing_keys",
    "set_member", // Remove,
    "set_node_certificate_validity",
    "set_node_data",
    "set_service_certificate_validity",
    "set_service_configuration",
    "set_service_principal",
    "set_user",
    "set_user_data",
    "transition_node_to_trusted",
    "transition_service_to_open",
    "trigger_ledger_chunk",
    "trigger_snapshot"
  ];

  if (allowedOperatorActions.includes(action.name)) {
    return true;
  }
  // Additionally, operators can add or retire other operators.
  if (action.name === "set_member") {
    const memberData = action.args["member_data"];
    if (memberData && memberData.is_operator) {
      return true;
    }
  } else if (action.name === "remove_member") {
    const memberId = ccf.pemToId(action.args.cert);
    if (isOperator(memberId)) {
      return true;
    }
  }
  return false;
}

export function resolve(proposal, proposerId, votes) {
  const actions = JSON.parse(proposal)["actions"];

  // Count member votes.
  const memberVoteCount = votes.filter(
    (v) => v.vote && !isOperator(v.member_id)
  ).length;

  // Count active members, excluding operators.
  let activeMemberCount = 0;
  ccf.kv["public:ccf.gov.members.info"].forEach((value, key) => {
    const memberId = ccf.bufToStr(key);
    const info = ccf.bufToJsonCompatible(value);
    if (info.status === "Active" && !isOperator(memberId)) {
      activeMemberCount++;
    }
  });

  // A proposal is an operator change if it's only applying operator actions.
  const isOperatorChange = actions.every(canOperatorPass);

  // A majority of members can always accept a proposal.
  if (memberVoteCount > Math.floor(activeMemberCount / 2)) {
    return "Accepted";
  }

  // Operators proposing operator changes can accept them without a vote.
  if (isOperatorChange && isOperator(proposerId)) {
    return "Accepted";
  }

  return "Open";
}
