/**
 * Host half of the balance readout plugin.
 *
 * All work happens in the browser bundle (`./client`): it reads the balance
 * through the account remote and renders it into the sidebar foot. This entry
 * exists so the package mounts as an ordinary Loader entry, which is what makes
 * its `dsh.client` artifact reach the Web GUI.
 */

/** Plugin name shown in Host logs. */
export const name = 'dsh-account-balance'

/**
 * Mount the plugin.
 *
 * Intentionally empty: the Client half owns the sidebar contribution.
 */
export function apply() {}
