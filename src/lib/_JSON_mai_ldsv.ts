
const db_host = 'sql';
// 利用クラス等の読み込み

// エラーメッセージ等を保存・表示するクラス
import { C_DspMessage }     from '../../../mai/src/d_utl/C_DspMessage';

// MySqlを扱うクラス
import mysql from "mysql2/promise";

/*******************************************************************************/
/*                                                                             */
/*                                 主　処　理                                   */
/*                                                                             */
/*******************************************************************************/

interface I_GlobalArguments {
    mode?: string;
    pid:   number;
}

interface I_Return {
    ecode:   number;
    emsg:    string;
    pid:     number;
    name:    string;
    mbname:  string;
}

class C_NorReturn implements I_Return {
    public ecode:   number = 0;
    public emsg:    string = '';
    public pid:     number = -1;
    public name:    string = '';
    public mbname:  string = '';
    public constructor(pid: number, name: string, mbname: string) {
        this.pid    = pid;
        this.name   = name;
        this.mbname = mbname;
    }
}

class C_ErrReturn implements I_Return {
    public ecode:   number = 1000;
    public emsg:    string = 'error';
    public pid:     number = -1;
    public name:    string = '';
    public mbname:  string = '';
    public constructor(ecode: number, emsg: string) {
        this.ecode  = ecode;
        this.emsg   = emsg;
    }
}


// Getting New Game startiing from Guld
export async function test(arg: I_GlobalArguments): Promise<I_Return> {
    let return_val: I_Return;

    init(arg);

    if (gv.mes.is_err()) {
        gv.mes.display_err_message();
        return_val = new C_ErrReturn(100, 'db_mai OPEN ERROR ');
    } else {
        return_val = await get_player();
    }

    finl();
    return return_val;
}

 
//////////////////////////////////////////////
///   サブルーチン
//////////////////////////////////////////////

async function get_player(): Promise<I_Return> {
    if (ga.pid === undefined) return new C_ErrReturn(999, 'Pid Undefined');

    return select_users().then(rslt_users => {
        if (rslt_users === undefined || gv.mes.is_err()) {
            gv.mes.display_err_message();
            return new C_ErrReturn(200, 'SQL ERROR ');
        }
        if (rslt_users.length < 1) return new C_ErrReturn(900, `No data exist on pid=${ga.pid}`);

        return new C_NorReturn(
            rslt_users[0].id, 
            rslt_users[0].name, 
            rslt_users[0].mbname
        );
    }).catch(err => {
        return new C_ErrReturn(100, 'SQL ERROR: ' + err);
    });
}

interface I_tbl_player extends mysql.RowDataPacket{
    id:      number;
    name:    string;
    passwd:  string;
    mbname:  string;
    email:   string;
}

async function select_users(): Promise<I_tbl_player[]|undefined> {
    const sql = `
        SELECT id, name, passwd, mbname, email FROM tbl_player
            WHERE  id = :id
    `;

    try {
        const [rsltRowSet] = await gv.db_pool.query<I_tbl_player[]>(sql, {id: ga.pid});
        return rsltRowSet;
    } catch (err) {
        gv.mes.set_err_message('SQL ERROR SELECT FROM tbl_player: ' + err);
        return undefined;
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

    public db_pool:   mysql.Pool;

    public constructor() {
        this.mes     = new C_DspMessage( /* isHTML = */ false);

        this.db_pool = mysql.createPool({
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
        this.db_pool.end();
    }
}

// POST引数の設定
class C_GlobalArguments {
    public mode: string;
    public pid:  number = -1;

    public constructor(obj: I_GlobalArguments|undefined) {
        this.mode = obj?.mode ?? 'unknown';
        this.pid  = obj?.pid  !== undefined && !isNaN(obj.pid)  ? Number(obj.pid)  : -1;
//debug        console.log(`mode=${this.mode}, pid = ${this.pid}`);
    }
}

/*
module.exports = newGame;
module.exports = newHero;
*/