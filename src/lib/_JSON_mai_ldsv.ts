    // 利用クラス等の読み込み

    
// エラーメッセージ等を保存・表示するクラス
import { C_DspMessage } from '../../../mai/src/d_utl/C_DspMessage';

// MySqlを扱うクラス
import mysql            from "mysql2/promise";

// Save/Load関係クラス全般
import { C_SaveInfo }   from '../../../mai/src/d_mdl/C_SaveInfo';
import { C_SaveData, JSON_SaveData }    from '../../../mai/src/d_mdl/C_SaveData';
import { C_SaveDataRDB, C_SaveInfoRDB } from '../../../mai/src/d_rdb/C_SaveDataRDB';

/*******************************************************************************/
/*                                                                             */
/*                                 主　処　理                                   */
/*                                                                             */
/*******************************************************************************/

interface I_Return {
    ecode:      number;
    emsg:       string;
    save_info?: C_SaveInfo[];
    save?:      C_SaveData;
}


export async function save_info(arg: I_GlobalArguments): Promise<I_Return> {
    init(arg);

    let   ret_val: I_Return;
    const save_array = await C_SaveInfoRDB.get_list_by_pid(gv.db_mai, gv.mes, ga.pid);
    if (gv.mes.is_err()) {
        ret_val = err_encode(500);
    } else {
        ret_val = all_save_info(0, save_array);
    }
    finl();
    return ret_val;
}

export async function tmp_load(arg: I_GlobalArguments): Promise<I_Return> {
    init(arg);
    const ret_val = await _load(ga.pid, 100, 330);
    finl();
    return ret_val;
}
export async function instant_load(arg: I_GlobalArguments): Promise<I_Return> {
    init(arg);
    const ret_val = await _load(ga.pid, 101, 310);
    finl();
    return ret_val;
}
export async function UD_load(arg: I_GlobalArguments): Promise<I_Return> {
    init(arg);
    const ret_val = await _load(ga.pid, 102, 350);
    finl();
    return ret_val;
}
export async function before_load(arg: I_GlobalArguments): Promise<I_Return> {
    init(arg);
    const ret_val = await _load(ga.pid, 103, 380);
    finl();
    return ret_val;
}
export async function general_load(arg: I_GlobalArguments): Promise<I_Return> {
    init(arg);
    const ret_val = await _load(ga.pid, ga.uno, 30);
    finl();
    return ret_val;
}


export async function tmp_save(arg: I_GlobalArguments): Promise<I_Return> {
    init(arg);
    const ret_val = await _save(100, '__TemporarySaveData__', 230);
    finl();
    return ret_val;
}
export async function instant_save(arg: I_GlobalArguments): Promise<I_Return> {
    init(arg);
    const ret_val = await _save(101, '__InstantSaveData__', 210);
    finl();
    return ret_val;
}
export async function UD_save(arg: I_GlobalArguments): Promise<I_Return> {
    init(arg);
    const ret_val = await _save(102, '__UpDownSaveData__', 250);
    finl();
    return ret_val;
}
export async function before_save(arg: I_GlobalArguments): Promise<I_Return> {
    init(arg);
    const ret_val = await _save(103, '__BeforeTheEventData__', 280);
    finl();
    return ret_val;
}
export async function general_save(arg: I_GlobalArguments): Promise<I_Return> {
    init(arg);
    const ret_val = await _save(ga.save?.uniq_no??99, ga.save?.title??'???', 230);
    finl();
    return ret_val;
}


//////////////////////////////////////////////
///   サブルーチン
//////////////////////////////////////////////

async function _load(pid: number, uno: number, ecode: number): Promise<I_Return> {
    await tr_begin(gv.db_mai);

    // ユニーク・ナンバーでsaveデータを探す。見つかればsave_idにセットする
    const save_id = await C_SaveInfoRDB.get_save_id_at_tbl(gv.db_mai, gv.mes, pid, uno);
    if (gv.mes.is_err()) {
        await tr_rollback(gv.db_mai);
        return all_save_data(ecode, undefined);;
    }

    // mezeやteam等の関連するデータを反映する
    const save_data02 = await C_SaveDataRDB.get_from_rdb(gv.db_mai, gv.mes, save_id);
    if (gv.mes.is_err()) {
        await tr_rollback(gv.db_mai);
        return all_save_data(ecode, undefined);;
    }

    await tr_commit(gv.db_mai);
    return all_save_data(0, save_data02);

}

async function _save(uniq_no: number, title: string, ecode: number): Promise<I_Return> {
    if (ga.save === undefined) return all_save_data(ecode, undefined)
    ga.save.uniq_no = uniq_no;
    ga.save.title   = title;

    await tr_begin(gv.db_mai);

    // ユニーク・ナンバーでsaveデータを探す。
    const save_id = await C_SaveInfoRDB.get_save_id_at_tbl(gv.db_mai, gv.mes, ga.save.player_id, ga.save.uniq_no);
    if (gv.mes.is_err()) {
        await tr_rollback(gv.db_mai);
        return all_save_data(ecode + 10, ga.save);
    }
    // 同じユニーク・ナンバーの既存データが有ったら一旦削除する
    if (save_id > 0) {
        const rslt01 = await C_SaveDataRDB.del_to_rdb(gv.db_mai, gv.mes, save_id); 
        if (rslt01 === false) {
            await tr_rollback(gv.db_mai);
            return all_save_data(ecode + 33, ga.save);
        }
    }
    // 改めて(別のレコードに)セーブする
    const rslt02 = await C_SaveDataRDB.set_to_rdb(gv.db_mai, gv.mes, ga.save);
    if (rslt02 === false) {
        await tr_rollback(gv.db_mai);
        return all_save_data(ecode + 23, ga.save);
    }

    await tr_commit(gv.db_mai);
    return all_save_data(0, ga.save);
}

function all_save_data(code: number, save: C_SaveData|undefined): I_Return {
    let ret_val: I_Return;

    if (code !== 0 || gv.mes.is_err()) {
        ret_val = new C_ErrReturn(code, gv.mes.get_err_messages().join("\n"));
    } else {
        ret_val = new C_NorReturn();
        if (save !== undefined) {
            ret_val.save = save;
        } else {
            ret_val.save = undefined;
        }
    }

    return ret_val;
}

function all_save_info(code: number, save_list: C_SaveInfo[]): I_Return {
    let ret_val: I_Return;

    if (code !== 0 || gv.mes.is_err()) {
        ret_val = new C_ErrReturn(code, gv.mes.get_err_messages().join("\n"));
    } else {
        ret_val = new C_NorReturn();
        ret_val.save_info = save_list;
    }

    return ret_val;
}



function err_encode(code: number): I_Return {
    const ret_assoc: I_Return = {ecode:code, emsg: ''};
    for (const msg of gv.mes.get_err_messages()) ret_assoc.emsg += msg + "\n"; 
    return ret_assoc;
}


class C_NorReturn implements I_Return {
    public ecode:   number = 0;
    public emsg:    string = 'Status OK';
    public constructor() {}
}

class C_ErrReturn implements I_Return {
    public ecode:   number = 1000;
    public emsg:    string = 'error';
    public constructor(ecode: number, emsg: string) {
        this.ecode  = ecode;
        this.emsg   = emsg;
    }
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
function finl(): void {
    gv.finl();
}

//////////////////////////////////////////////
/////
/////     クラス宣言
/////
//////////////////////////////////////////////

    // 大域変数の設定
    class C_GlobalVar {
        public mes: C_DspMessage;

        public db_host:   string = "sql";
        public db_port:   number =  3306;
        public db_name:   string = "db_mai";
        public db_user:   string = "itsayno33";
        public db_pass:   string = "PE333833";
    
        public db_mai:    mysql.Pool;
    
        public constructor() {
            this.mes     = new C_DspMessage( /* isHTML = */ false);
    
            this.db_mai  = mysql.createPool({
                host:      this.db_host,
                port:      this.db_port,
                user:      this.db_user,
                password:  this.db_pass,
                database:  this.db_name,
                connectionLimit:     10, // 接続を張り続ける数
                waitForConnections: true,
                namedPlaceholders: true,
                jsonStrings: true,
            });
        }
        public finl() {
            this.db_mai.end();
        }
    }
    
    interface I_GlobalArguments {
        mode?:        string;
        pid?:         number;
        uno?:         number;
        save_id?:     number;
        save_title?:  string; 
        save_detail?: string; 
        save_point?:  string; 
        save_time?:   string; 
        save?:        JSON_SaveData;
    }
    
            // POST引数の設定
    class C_GlobalArguments {
        public mode:      string          = 'unknown';
        
        public save_JSON: string          = '';
        public save:        C_SaveData|undefined = undefined; 

        public pid:         number =  1;
        public uno:         number = -1;
        public save_id:     number = -1;
        public save_title:  string = ''; 
        public save_detail: string = ''; 
        public save_point:  string = ''; 
        public save_time:   string = ''

        public constructor(obj: I_GlobalArguments|undefined) {
            if (obj === undefined) return;

            this.mode        = obj.mode ?? this.mode;
            this.pid         = obj.pid  ?? this.pid;
            this.uno         = obj.uno  ?? this.uno;
            this.save        = new C_SaveData(obj.save) ?? this.save;
            this.save_id     = Number(obj.save_id)      ?? this.save_id;
            this.save_title  = obj.save_title           ?? this.save_title;
            this.save_detail = obj.save_detail          ?? this.save_detail;
            this.save_point  = obj.save_point           ?? this.save_point;
        }
    }

///////////////////////////////////////////////
///   データベース関係 
///////////////////////////////////////////////   


    async function tr_begin(db_mai: mysql.Pool): Promise<boolean> {
        try {
            await db_mai.beginTransaction();
        } catch (err) {
            gv.mes.set_err_message("トランザクションの開始失敗: " + err);
            return false;
        } 
        return true;
    }

    async function tr_commit(db_mai: mysql.Pool): Promise<boolean> {
        try {
            await db_mai.commit();
        } catch (err) {
            gv.mes.set_err_message("トランザクションのコミット失敗" + err);
            return false;
        } 
        return true;
    }

    async function tr_rollback(db_mai: mysql.Pool): Promise<boolean> {
        try {
            await db_mai.rollback();
        } catch (err) {
            gv.mes.set_err_message("トランザクションのロールバック失敗" + err);
            return false;
        } 
        return true;
    }

