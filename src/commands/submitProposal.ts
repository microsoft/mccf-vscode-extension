import * as vscode from "vscode";
import { execSync } from 'child_process'; 

export function submitProposalCommand() {
    execSync('./scripts/proposalscript.sh');
}