import { ChevronRightIcon, StarIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

export function ItemDemo() {
  return (
    <div className="max-w-sm">
      <ItemGroup>
        <Item variant="muted">
          <ItemMedia>
            <Avatar>
              <AvatarImage alt="@aria" src="/avatars/female-l-1.avif" />
              <AvatarFallback>{"AC"}</AvatarFallback>
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{"Aria Chen"}</ItemTitle>
            <ItemDescription>{"aria@frakment.dev"}</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Badge variant="secondary">{"Admin"}</Badge>
            <Button aria-label="Open" size="icon-xs" variant="ghost">
              <ChevronRightIcon />
            </Button>
          </ItemActions>
        </Item>
        <Item variant="muted">
          <ItemMedia>
            <Avatar>
              <AvatarImage alt="@ben" src="/avatars/male-l.avif" />
              <AvatarFallback>{"BO"}</AvatarFallback>
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{"Ben Ortiz"}</ItemTitle>
            <ItemDescription>{"ben@frakment.dev"}</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button aria-label="Favorite" size="icon-xs" variant="ghost">
              <StarIcon />
            </Button>
          </ItemActions>
        </Item>
        <Item variant="muted">
          <ItemMedia>
            <Avatar>
              <AvatarImage alt="@cleo" src="/avatars/female-l-2.avif" />
              <AvatarFallback>{"CP"}</AvatarFallback>
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{"Cleo Park"}</ItemTitle>
            <ItemDescription>{"cleo@frakment.dev"}</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Badge variant="outline">{"Member"}</Badge>
          </ItemActions>
        </Item>
      </ItemGroup>
    </div>
  );
}
