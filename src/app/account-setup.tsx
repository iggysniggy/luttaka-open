import React, {type FC, type PropsWithChildren, useEffect} from "react";
import {api} from "@/trpc/react";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {User} from "lucide-react";
import {AccountProgress} from "@/app/account-progress";


export const AccountSetup: FC<PropsWithChildren> = (props) => {

  const isAccountSetup = api.account.isAccountSetup.useQuery();
  const apiSetupAccount = api.account.setupAccount.useMutation();

  useEffect(() => {
    if (isAccountSetup.isLoading || isAccountSetup.data === true) {
      return;
    }
    apiSetupAccount.mutate();
  }, [isAccountSetup.data]);

  if (!apiSetupAccount.isLoading) {
    return props.children;
  }

  return (
    <div className={"flex justify-center items-center"}>
      <Card className={"m-3 absolute top-[50%] translate-y-[-50%]"}>
        <CardHeader>
          <h1 className={"text-xl font-bold"}>Setting up your Account</h1>
        </CardHeader>
        <CardContent className={"space-y-2"}>
          <AccountProgress
            active={apiSetupAccount.isLoading}
            done={apiSetupAccount.isSuccess}
            title={"Setting up your user"}
            inactiveIcon={<User/>}/>
        </CardContent>
      </Card>
    </div>
  );
}


