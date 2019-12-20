#!/usr/bin/perl

#-------------------------------------------------------------------------------
#         Copyrights 2006-2007 (c) WebSpamProtect.com
#         Filename : wsp_captcha.pl
#         Version  : 1.2
#-------------------------------------------------------------------------------

use LWP::Simple qw(!head);
use CGI qw/:standard/;
use HTTP::Request::Common;
use LWP::UserAgent;
use URI::Escape;

my $WSP_Version = '1.2';
my $WSP_UserKey = "68ZE-CHH7-UP28-T371";

# This sub will check captcha code entered by user and stop spam robots
sub WSP_CheckImageCode {
	my $wsp_key = param('wsp_key') or return "Error: 'wsp_key' is invalid.";
	my $wsp_code = param('wsp_code') or return "Error: 'wsp_code' is invalid.";
	if (length($wsp_key) > 32) {
		return "Error: 'wsp_key' is invalid.";
	}
	if (length($wsp_code) > 10) {
		return "Error: 'wsp_code' is invalid.";
	}

	my $WSP_Result;
	$WSP_Result = get("http://webspamprotect.com/checkcode.php?ver=".$WSP_Version."&userkey=".$WSP_UserKey."&imgkey=".uri_escape($wsp_key)."&imgcode=".uri_escape($wsp_code));
	if ($WSP_Result == 200) {
		return "OK";
	} elsif ($WSP_Result == 404) {
		return "Error: The image code entered by user is invalid.";
	} else {
		return "Unknown Error";
	}
}
1;