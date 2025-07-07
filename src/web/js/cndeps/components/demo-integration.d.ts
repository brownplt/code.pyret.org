import { Graph } from 'graphlib';

interface IAtom {
    id: string;
    type: string;
    label: string;
}
interface ITuple {
    atoms: string[];
    types: string[];
}
interface IType {
    id: string;
    types: string[];
    atoms: IAtom[];
    isBuiltin: boolean;
}
interface IRelation {
    id: string;
    name: string;
    types: string[];
    tuples: ITuple[];
}
interface IDataInstance {
    getAtomType(id: string): IType;
    getTypes(): readonly IType[];
    getAtoms(): readonly IAtom[];
    getRelations(): readonly IRelation[];
    applyProjections(atomIds: string[]): IDataInstance;
    generateGraph(hideDisconnected: boolean, hideDisconnectedBuiltIns: boolean): Graph;
}
interface IInputDataInstance extends IDataInstance {
    addAtom(atom: IAtom): void;
    addRelationTuple(relationId: string, t: ITuple): void;
    removeAtom(id: string): void;
    removeRelationTuple(relationId: string, t: ITuple): void;
    reify(): unknown;
}

/**
 * Example integration of CndLayoutInterface and InstanceBuilder with webcola-integrated-demo.html
 *
 * This file demonstrates how to mount the React components into the existing demo page
 * and integrate them with the existing JavaScript functions.
 */

/**
 * Mount the React component into the demo page
 * Call this function after the DOM is loaded
 */
declare function mountCndLayoutInterface(): void;
/**
 * Mount InstanceBuilder component into the demo page
 *
 * @example
 * ```javascript
 * // In your demo page JavaScript:
 * window.addEventListener('load', () => {
 *   mountInstanceBuilder();
 * });
 * ```
 */
declare function mountInstanceBuilder(): void;
/**
 * Get current instance from InstanceBuilder component
 */
declare function getCurrentInstanceFromReact(): IInputDataInstance | undefined;
/**
 * Get current CND specification from React component state
 * This function provides access to the most current specification
 *
 * @returns Current CND specification string or undefined if not available
 *
 * @example
 * ```javascript
 * // In your demo page JavaScript:
 * const cndSpec = getCurrentCNDSpecFromReact();
 * if (cndSpec) {
 *   console.log('Current spec:', cndSpec);
 * }
 * ```
 */
declare function getCurrentCNDSpecFromReact(): string | undefined;
/**
 * Mount both InstanceBuilder and CndLayoutInterface components
 */
declare function mountIntegratedComponents(): void;

export { getCurrentCNDSpecFromReact, getCurrentInstanceFromReact, mountCndLayoutInterface, mountInstanceBuilder, mountIntegratedComponents };
