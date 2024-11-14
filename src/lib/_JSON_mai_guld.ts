
const db_host = 'sql';
// 利用クラス等の読み込み

// エラーメッセージ等を保存・表示するクラス
import {C_DspMessage }     from '../../../mai/src/d_utl/C_DspMessage';

// 位置と方向を表すクラス
import { C_PointDir }      from '../../../mai/src/d_mdl/C_PointDir';

// 滞在位置を示すクラス
import { C_MovablePoint }  from '../../../mai/src/d_mdl/C_MovablePoint';

// ギルドクラス全般
import {C_Guild}           from '../../../mai/src/d_mdl/C_Guild';

// パーティークラス全般
import {C_Team}            from '../../../mai/src/d_mdl/C_Team';

// ヒーロークラス全般
import {C_Hero, JSON_Hero} from  '../../../mai/src/d_mdl/C_Hero';

// セーブデータ(クライアントとの連携)全般
import {C_SaveData, JSON_SaveData} from '../../../mai/src/d_mdl/C_SaveData';

/*******************************************************************************/
/*                                                                             */
/*                                 主　処　理                                   */
/*                                                                             */
/*******************************************************************************/

interface I_GlobalArguments {
    mode?: string;
    num?:  number;
    pid?:  number;
    hres_JSON?: string;
}

interface I_Return {
    ecode: number;
    emsg:  string;
    save?: JSON_SaveData;
    data?: {
        hres:JSON_Hero[];
    }
}

export function newGame(arg: I_GlobalArguments): I_Return {
    init(arg);
    const  guld = new_guld();
    const  team = new_team(guld);
    const  save = new_save(guld, team);
    return save_encode(0, save);
}

export function newHres(arg: I_GlobalArguments): I_Return {
    init(arg);
    const  hres = new_hres();
    return hres_encode(0,  hres);
}

 
//////////////////////////////////////////////
///   サブルーチン
//////////////////////////////////////////////

function err_encode(code: number, msgs: string[]): I_Return {
    const ret_assoc: I_Return = {ecode:code, emsg: ''};
    for (const msg in msgs) ret_assoc.emsg += msg; 
    return ret_assoc;
}

function save_encode(code: number, save: C_SaveData): I_Return {
    const ret_assoc: I_Return = {ecode:0, emsg: ''};

    if (code !== 0 || gv.mes.is_err()) {
        return err_encode(code, gv.mes.get_err_messages());
    } else {
        ret_assoc.ecode = 0;
        ret_assoc.emsg  = 'Status OK';
        ret_assoc.save  = save.encode();
    }

    return ret_assoc;
}

function hres_encode(code: number, hres: C_Hero[]): I_Return {
    const ret_assoc: I_Return = {ecode:0, emsg: ''};

    if (code !== 0 || gv.mes.is_err()) {
        return err_encode(code, gv.mes.get_err_messages());
    } else {
        ret_assoc.ecode = 0;
        ret_assoc.emsg  = 'Status OK';

        const hres_array: JSON_Hero[] = [];
        for(const hero of hres) {
            hres_array.push(hero.encode());
        }
        ret_assoc.data  = {hres: hres_array};
        return ret_assoc;
    }
}

function new_hres(): C_Hero[] {
    const heroes: C_Hero[] = [];
    for (let i = 0; i < ga.num; i++) {
        heroes.push((new C_Hero()).random_make());
    }
    return heroes;
}

function new_save(guld: C_Guild, team: C_Team): C_SaveData {
    return new C_SaveData({
        player_id: ga.pid,
        auto_mode: '0',
        is_active: '1',
        is_delete: '0',

        all_mvpt:   [],
        all_maze:   [],
        all_guld:   [guld.encode()], 
        all_team:   [team.encode()],

//loc
        mypos:      team.get_loc().encode(), 
});
}

function new_guld(): C_Guild {
    const guld = new C_Guild();
    guld.decode({name: '始まりの街の冒険者ギルド'});

    for (let i = 0; i < 12; i++) {
        guld.add_hero((new C_Hero()).random_make());
    }

    return guld;
}

function new_team(guld: C_Guild): C_Team {
    const team = new C_Team();
//loc
    const loc = new C_MovablePoint();
    loc.decode({
        kind:   'Guld',
        name:    guld.get_name(),
        loc_uid: guld.uid(),
        loc_pos: new C_PointDir({
            'x': 0,
            'y': 0,
            'z': 0,
            'd': 0,
        }),
        team_uid: team.uid(),
    });
    team.set_prp({name:'ひよこさんチーム'});
//loc
    team.set_loc(loc);

    //    team.set_loc((new C_MovablePoint()).decode(loc.encode()));
    for (let i = 0; i <= 3; i++) { 
        team.add_hero((new C_Hero()).random_make());
    }

    return team;
}


/*******************************************************************************/
/*                                                                             */
/*                                初　期　設　定                                */
/*                                                                             */
/*******************************************************************************/

let gv: C_GlobalVar;
let ga: C_GlobalArguments;

function init(obj: I_GlobalArguments): void {
    gv = new C_GlobalVar();
    ga = new C_GlobalArguments(obj);
    return;
}

//////////////////////////////////////////////
/////
/////     クラス宣言
/////
//////////////////////////////////////////////

// 大域変数の設定
class C_GlobalVar {
    public mes: C_DspMessage;

    public Maze_size_x = 21;
    public Maze_size_y = 21;
    public Limit_of_room     = 5;
    public Max_size_of_room  = 3;
    public Max_of_Maze_Floor = 3;

    public team_assoc: C_Team[]  = [];
    public team:       C_Team;
    public guld_assoc: C_Guild[] = [];
    public guld:       C_Guild;
    public heroes:     C_Hero[]  = [];

    public constructor() {
        this.mes  = new C_DspMessage( /* isHTML = */ false);
        this.team = new C_Team();
        this.guld = new C_Guild();
    }
}

// POST引数の設定
class C_GlobalArguments {
    public mode: string;
    public num: number = 1;
    public pid: number = 1;
    public hres_JSON: string|undefined = '';

    public constructor(obj: I_GlobalArguments|undefined) {
        this.mode = obj?.mode ?? 'unknown';
        this.num  = obj?.num !== undefined && !isNaN(obj.num) ? Number(obj.num) : 1;
        this.pid  = obj?.pid !== undefined && !isNaN(obj.pid) ? Number(obj.pid) : 1;
        this.hres_JSON = obj?.hres_JSON ?? undefined;
    }
}

/*
module.exports = newGame;
module.exports = newHero;
*/