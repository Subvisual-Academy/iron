use clap::Parser;

pub fn parse() -> Args {
    Args::parse()
}

#[derive(Parser, Debug)]
#[command(name = "Iron Wallet", author, version, about, long_about = None)]
pub struct Args {
    #[arg(long, default_value_t = 9003, env = "IRON_HTTP_PORT")]
    pub http_port: u16,

    #[arg(long, default_value_t = 9002, env = "IRON_WS_PORT")]
    pub ws_port: u16,

    #[arg(long, default_value_t = false)]
    pub hidden: bool,
}
