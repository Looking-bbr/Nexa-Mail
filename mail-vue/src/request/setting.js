import http from '@/axios/index.js';
import {withBrandDefaults} from '@/utils/branding.js';

export function settingSet(setting) {
    return http.put('/setting/set', setting)
}

export function settingQuery() {
    return http.get('/setting/query').then(withBrandDefaults)
}

export function websiteConfig() {
    return http.get('/setting/websiteConfig').then(withBrandDefaults)
}

export function setBackground(background) {
    return http.put('/setting/setBackground',{background})
}

export function deleteBackground() {
    return http.delete('/setting/deleteBackground')
}

export function setBlackList(params) {
    return http.put('/setting/setBlacklist', params)
}
