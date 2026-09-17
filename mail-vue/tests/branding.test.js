import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import test from 'node:test';
import {withBrandDefaults} from '../src/utils/branding.js';

const root = new URL('../../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');

test('legacy default website and notice titles display the Nexa brand', () => {
    assert.deepEqual(withBrandDefaults({title: 'Cloud Mail', noticeTitle: 'Cloud Mail'}), {
        title: 'Nexa Mail', noticeTitle: 'Nexa Mail',
    });
});

test('custom titles and non-exact legacy matches are never replaced', () => {
    for (const title of ['My mailbox', 'Nexa Mail', 'Team Cloud Mail', 'Cloud Mail ', 'cloud mail', '', null]) {
        assert.deepEqual(withBrandDefaults({title, noticeTitle: title}), {title, noticeTitle: title});
    }
    assert.deepEqual(withBrandDefaults({title: 'Cloud Mail', noticeTitle: 'Custom notice'}), {
        title: 'Nexa Mail', noticeTitle: 'Custom notice',
    });
});

test('read compatibility does not mutate settings or unrelated content', () => {
    const settings = Object.freeze({
        title: 'Cloud Mail',
        noticeTitle: 'Cloud Mail',
        noticeContent: 'An administrator-authored notice',
        domainList: Object.freeze(['@example.com']),
        githubSwitch: 0,
        tgBotStatus: 0,
        resendTokens: Object.freeze({}),
    });
    const branded = withBrandDefaults(settings);
    assert.notEqual(branded, settings);
    assert.equal(settings.title, 'Cloud Mail');
    assert.equal(settings.noticeTitle, 'Cloud Mail');
    for (const key of Object.keys(settings).filter(key => !['title', 'noticeTitle'].includes(key))) {
        assert.equal(branded[key], settings[key]);
    }
    assert.deepEqual(withBrandDefaults({}), {});
});

test('both settings read endpoints use the presentation adapter, not write endpoints', () => {
    const source = read('mail-vue/src/request/setting.js');
    assert.match(source, /http\.get\('\/setting\/query'\)\.then\(withBrandDefaults\)/);
    assert.match(source, /http\.get\('\/setting\/websiteConfig'\)\.then\(withBrandDefaults\)/);
    assert.match(source, /return http\.put\('\/setting\/set', setting\)/);
    assert.equal((source.match(/\.then\(withBrandDefaults\)/g) || []).length, 2);
});

test('HTML and each supported environment use the Nexa brand', () => {
    const html = read('mail-vue/index.html');
    assert.match(html, /<title>Nexa Mail<\/title>/);
    assert.match(html, /class="loading-image"[^>]*alt="Nexa Mail"/);
    assert.match(html, /rel="icon" href="\/mail.png"/);
    assert.doesNotMatch(html, /Cloud Mail|\/public\/mail.png/);
    for (const mode of ['dev', 'release', 'remote']) {
        assert.match(read(`mail-vue/.env.${mode}`), /VITE_PWA_NAME = 'Nexa Mail'/);
    }
    assert.match(read('mail-vue/.env.remote'), /VITE_BASE_URL = 'https:\/\/skymail\.ink\/api'/);
    assert.match(read('mail-vue/.env.release'), /VITE_BASE_URL = '\/api'/);
});

test('production UI sources do not contain upstream promotion URLs', () => {
    const forbidden = /maillab\/cloud-mail|skymail\.ink|cloud_mail_tg|trendshift\.io/i;
    function scan(directory) {
        for (const entry of readdirSync(new URL(directory, root), {withFileTypes: true})) {
            const path = `${directory}/${entry.name}`;
            if (entry.isDirectory()) scan(path);
            else if (/\.(vue|js|html|css|scss)$/.test(path)) {
                assert.doesNotMatch(read(path), forbidden, path);
                if (path !== 'mail-vue/src/utils/branding.js') {
                    assert.doesNotMatch(read(path), /Cloud Mail/, path);
                }
            }
        }
    }
    scan('mail-vue/src');
});

test('favicon and PWA PNG dimensions match their declared sizes', () => {
    for (const [filename, size] of [['mail.png', 64], ['mail-pwa.png', 192], ['mail-pwa-512.png', 512]]) {
        const png = readFileSync(new URL(`mail-vue/public/${filename}`, root));
        assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
        assert.equal(png.readUInt32BE(16), size, filename);
        assert.equal(png.readUInt32BE(20), size, filename);
    }
    const config = read('mail-vue/vite.config.js');
    assert.match(config, /src: 'mail-pwa.png',\s*sizes: '192x192'/);
    assert.match(config, /src: 'mail-pwa-512.png',\s*sizes: '512x512'/);
});

const initSource = read('mail-worker/src/init/init.js');
const createSettings = initSource.match(/CREATE TABLE IF NOT EXISTS setting \([\s\S]*?\n\s*\)/)[0];
const seedSettings = initSource.match(/INSERT INTO setting \([\s\S]*?WHERE NOT EXISTS \(SELECT 1 FROM setting\)/)[0];
const addNoticeTitle = initSource.match(/ALTER TABLE setting ADD COLUMN notice_title[^;]*;/)[0];

test('new database title defaults use Nexa Mail', () => {
    const db = new DatabaseSync(':memory:');
    try {
        db.exec(createSettings);
        db.exec(seedSettings);
        db.exec(addNoticeTitle);
        const row = db.prepare('SELECT title, notice_title FROM setting').get();
        assert.equal(row.title, 'Nexa Mail');
        assert.equal(row.notice_title, 'Nexa Mail');
    } finally {
        db.close();
    }
});

test('rerunning the guarded seed leaves existing and customized database values intact', () => {
    for (const title of ['Cloud Mail', 'Team mailbox']) {
        const db = new DatabaseSync(':memory:');
        try {
            db.exec(createSettings);
            db.exec(seedSettings);
            db.exec(addNoticeTitle);
            db.prepare('UPDATE setting SET title = ?, notice_title = ?').run(title, 'Custom notice');
            db.exec(seedSettings);
            const row = db.prepare('SELECT title, notice_title FROM setting').get();
            assert.equal(row.title, title);
            assert.equal(row.notice_title, 'Custom notice');
            assert.equal(db.prepare('SELECT COUNT(*) AS n FROM setting').get().n, 1);
        } finally {
            db.close();
        }
    }
});
